'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
<<<<<<< HEAD
import { analyzeBudget, suggestBudgetLimit } from '@/lib/ai'
import { startOfMonth, subMonths } from 'date-fns'
=======
>>>>>>> 17ec09116087da1a5bc493a4776d82b69d2d3f39

export async function setBudget(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const category_id = formData.get('category_id') as string // or 'global'
    const amount = parseFloat(formData.get('amount') as string)

    // Check if budget exists for this category/user
    // For simplicity, we assume one budget per category per user (monthly).

    // Upsert logic
    // First, try to find existing budget
    let query = supabase.from('budgets').select('id').eq('user_id', user.id)

    if (category_id === 'global') {
        query = query.is('category_id', null)
    } else {
        query = query.eq('category_id', category_id)
    }

    const { data: existing } = await query.single()

    let error;
    if (existing) {
        const { error: err } = await supabase.from('budgets').update({ amount }).eq('id', existing.id)
        error = err
    } else {
        const { error: err } = await supabase.from('budgets').insert({
            user_id: user.id,
            category_id: category_id === 'global' ? null : category_id,
            amount,
            period: 'monthly'
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
<<<<<<< HEAD

export async function getAIInsights() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch transactions from the last 3 months
    const threeMonthsAgo = subMonths(new Date(), 3).toISOString()
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, categories(name)')
        .eq('user_id', user.id)
        .gte('date', threeMonthsAgo)
        .order('date', { ascending: false })

    // Fetch current budgets
    const { data: budgets } = await supabase
        .from('budgets')
        .select('*, categories(name)')
        .eq('user_id', user.id)

    if (!transactions || !budgets) return { error: 'No se pudieron recuperar los datos para el análisis.' }

    const insights = await analyzeBudget(transactions, budgets)

    // Persist the insight to history
    if (insights && !insights.includes("no pudo analizar")) {
        await supabase.from('ai_insights').insert({
            user_id: user.id,
            insight_type: 'budget_analysis',
            content: insights,
            metadata: { transaction_count: transactions.length, budget_count: budgets.length }
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

export async function getBudgetSuggestion(categoryId: string | 'global') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch last 6 months of history for this specific category
    const sixMonthsAgo = subMonths(new Date(), 6).toISOString()
    let query = supabase
        .from('transactions')
        .select('amount, date, categories(name)')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', sixMonthsAgo)

    if (categoryId !== 'global') {
        query = query.eq('category_id', categoryId)
    }

    const { data: history } = await query

    if (!history || history.length === 0) {
        return { error: 'No hay suficiente historial para generar una sugerencia.' }
    }

    const categoryName = categoryId === 'global' ? 'Global' : (history[0].categories as any)?.name || 'Categoría seleccionada'
    const suggestion = await suggestBudgetLimit(categoryName, history)

    return { suggestion }
}
=======
>>>>>>> 17ec09116087da1a5bc493a4776d82b69d2d3f39
