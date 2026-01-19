'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { analyzeBudget, suggestBudgetLimit } from '@/lib/ai'
import { startOfMonth, subMonths } from 'date-fns'
import type { Budget, BudgetFormData, AIInsight } from '@/types/database'

// =============================================
// HELPERS
// =============================================

async function getDefaultCurrencyId(
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never
): Promise<string | null> {
    const { data } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'HNL')
        .single()
    return data?.id || null
}

async function getTransactionTypeId(
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
    code: string
): Promise<string | null> {
    const { data } = await supabase
        .from('transaction_types')
        .select('id')
        .eq('code', code)
        .single()
    return data?.id || null
}

// =============================================
// CRUD OPERATIONS
// =============================================

export async function setBudget(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const category_id = formData.get('category_id') as string // or 'global'
    const amount = parseFloat(formData.get('amount') as string)
    const period_type = (formData.get('period_type') as string) || 'monthly'
    const name = formData.get('name') as string || null
    const alert_threshold = parseFloat(formData.get('alert_threshold') as string) || 80

    // Get default currency
    const currency_id = await getDefaultCurrencyId(supabase)

    // Upsert logic: Check if budget exists for this category/user
    let query = supabase.from('budgets').select('id').eq('user_id', user.id)

    if (category_id === 'global') {
        query = query.is('category_id', null)
    } else {
        query = query.eq('category_id', category_id)
    }

    const { data: existing } = await query.single()

    let error
    if (existing) {
        const { error: err } = await supabase
            .from('budgets')
            .update({
                amount,
                period_type,
                name,
                alert_threshold,
                currency_id,
            })
            .eq('id', existing.id)
        error = err
    } else {
        const { error: err } = await supabase.from('budgets').insert({
            user_id: user.id,
            category_id: category_id === 'global' ? null : category_id,
            amount,
            period_type,
            name,
            alert_threshold,
            currency_id,
        })
        error = err
    }

    if (error) return { error: error.message }

    revalidatePath('/budget')
    return { success: true }
}

export async function deleteBudget(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/budget')
    return { success: true }
}

export async function updateBudget(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const amount = parseFloat(formData.get('amount') as string)
    const period_type = formData.get('period_type') as string || 'monthly'
    const name = formData.get('name') as string || null
    const alert_threshold = parseFloat(formData.get('alert_threshold') as string) || 80
    const is_active = formData.get('is_active') !== 'false'

    const { error } = await supabase
        .from('budgets')
        .update({
            amount,
            period_type,
            name,
            alert_threshold,
            is_active,
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/budget')
    return { success: true }
}

// =============================================
// AI INSIGHTS
// =============================================

export async function getAIInsights() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get expense transaction type ID
    const expenseTypeId = await getTransactionTypeId(supabase, 'expense')

    // Fetch transactions from the last 3 months
    const threeMonthsAgo = subMonths(new Date(), 3).toISOString()

    let txQuery = supabase
        .from('transactions')
        .select('*, categories(name, category_types(code))')
        .eq('user_id', user.id)
        .gte('date', threeMonthsAgo)
        .order('date', { ascending: false })

    const { data: transactions } = await txQuery

    // Fetch current budgets
    const { data: budgets } = await supabase
        .from('budgets')
        .select('*, categories(name)')
        .eq('user_id', user.id)
        .eq('is_active', true)

    if (!transactions || !budgets) {
        return { error: 'No se pudieron recuperar los datos para el análisis.' }
    }

    const insights = await analyzeBudget(transactions, budgets)

    // Persist the insight to history
    if (insights && !insights.includes("no pudo analizar")) {
        await supabase.from('ai_insights').insert({
            user_id: user.id,
            insight_type: 'budget_analysis',
            content: insights,
            context: {
                transaction_count: transactions.length,
                budget_count: budgets.length,
            },
            severity: 'info',
            is_actionable: true,
        })
    }

    revalidatePath('/budget')
    return { insights }
}

export async function getAIHistory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: history, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) return { error: error.message }
    return { history }
}

export async function deleteAIInsight(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('ai_insights').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/budget')
    return { success: true }
}

export async function dismissAIInsight(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ai_insights')
        .update({ is_dismissed: true })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/budget')
    return { success: true }
}

export async function markInsightAsRead(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
}

export async function getBudgetSuggestion(categoryId: string | 'global') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get expense transaction type ID
    const expenseTypeId = await getTransactionTypeId(supabase, 'expense')

    // Fetch last 6 months of history for this specific category
    const sixMonthsAgo = subMonths(new Date(), 6).toISOString()

    let query = supabase
        .from('transactions')
        .select('amount, date, categories(name)')
        .eq('user_id', user.id)
        .gte('date', sixMonthsAgo)

    if (expenseTypeId) {
        query = query.eq('transaction_type_id', expenseTypeId)
    }

    if (categoryId !== 'global') {
        query = query.eq('category_id', categoryId)
    }

    const { data: history } = await query

    if (!history || history.length === 0) {
        return { error: 'No hay suficiente historial para generar una sugerencia.' }
    }

    const categoryName = categoryId === 'global'
        ? 'Global'
        : (history[0].categories as { name: string })?.name || 'Categoría seleccionada'

    const suggestion = await suggestBudgetLimit(categoryName, history)

    return { suggestion }
}

// =============================================
// DATA FETCHING
// =============================================

export async function getBudgets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('budgets')
        .select('*, categories(name, icon, color), currencies(symbol)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function getBudgetProgress(budgetId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get budget
    const { data: budget } = await supabase
        .from('budgets')
        .select('*, categories(name)')
        .eq('id', budgetId)
        .eq('user_id', user.id)
        .single()

    if (!budget) return { error: 'Presupuesto no encontrado.' }

    // Get expense transaction type
    const expenseTypeId = await getTransactionTypeId(supabase, 'expense')

    // Calculate period dates based on period_type
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (budget.period_type) {
        case 'weekly':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
            break
        case 'monthly':
            startDate = startOfMonth(now)
            break
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
        default:
            startDate = startOfMonth(now)
    }

    // Query transactions for the period
    let txQuery = supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())

    if (expenseTypeId) {
        txQuery = txQuery.eq('transaction_type_id', expenseTypeId)
    }

    if (budget.category_id) {
        txQuery = txQuery.eq('category_id', budget.category_id)
    }

    const { data: transactions } = await txQuery

    const spent = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
    const remaining = Math.max(0, Number(budget.amount) - spent)
    const percentage = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0

    return {
        budget,
        spent,
        remaining,
        percentage,
        isOverBudget: spent > Number(budget.amount),
        isNearLimit: percentage >= budget.alert_threshold,
    }
}
