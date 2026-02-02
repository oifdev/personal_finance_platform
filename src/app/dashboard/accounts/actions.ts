'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AccountFormData, Account, AccountType, Currency, CardIssuer } from '@/types/database'

// =============================================
// HELPERS
// =============================================

async function getAccountTypeId(
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
    code: string
): Promise<string | null> {
    const { data } = await supabase
        .from('account_types')
        .select('id')
        .eq('code', code)
        .single()
    return data?.id || null
}

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

export async function createAccount(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const accountTypeCode = formData.get('account_type') as string // 'cash', 'bank', 'credit_card', etc.
    const currencyCode = formData.get('currency') as string || 'HNL'
    const initial_balance = parseFloat(formData.get('initial_balance') as string || '0')

    // Credit card specific fields
    const card_issuer_id = formData.get('card_issuer_id') as string || null
    const last_4_digits = formData.get('last_4_digits') as string || null
    const credit_limit = formData.get('credit_limit') ? parseFloat(formData.get('credit_limit') as string) : null
    const cutoff_day = formData.get('cutoff_day') ? parseInt(formData.get('cutoff_day') as string) : null
    const payment_day = formData.get('payment_day') ? parseInt(formData.get('payment_day') as string) : null

    const color = formData.get('color') as string || null
    const icon = formData.get('icon') as string || null
    const notes = formData.get('notes') as string || null

    // Resolve IDs
    const account_type_id = await getAccountTypeId(supabase, accountTypeCode)
    if (!account_type_id) return { error: `Tipo de cuenta inválido: ${accountTypeCode}` }

    const { data: currency } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', currencyCode)
        .single()
    const currency_id = currency?.id || await getDefaultCurrencyId(supabase)
    if (!currency_id) return { error: 'No se pudo determinar la moneda.' }

    const payload = {
        user_id: user.id,
        account_type_id,
        currency_id,
        name,
        initial_balance,
        current_balance: initial_balance, // Start with initial balance
        card_issuer_id: accountTypeCode === 'credit_card' ? card_issuer_id : null,
        last_4_digits: accountTypeCode === 'credit_card' ? last_4_digits : null,
        credit_limit: accountTypeCode === 'credit_card' ? credit_limit : null,
        cutoff_day: accountTypeCode === 'credit_card' ? cutoff_day : null,
        payment_day: accountTypeCode === 'credit_card' ? payment_day : null,
        color,
        icon,
        notes,
    }

    const { error } = await supabase.from('accounts').insert(payload)

    if (error) return { error: error.message }
    revalidatePath('/accounts')
    revalidatePath('/cards') // Legacy path support
    revalidatePath('/transactions')
    return { success: true }
}

export async function updateAccount(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const last_4_digits = formData.get('last_4_digits') as string || null
    const credit_limit = formData.get('credit_limit') ? parseFloat(formData.get('credit_limit') as string) : null
    const cutoff_day = formData.get('cutoff_day') ? parseInt(formData.get('cutoff_day') as string) : null
    const payment_day = formData.get('payment_day') ? parseInt(formData.get('payment_day') as string) : null
    const color = formData.get('color') as string || null
    const icon = formData.get('icon') as string || null
    const notes = formData.get('notes') as string || null

    const payload = {
        name,
        last_4_digits,
        credit_limit,
        cutoff_day,
        payment_day,
        color,
        icon,
        notes,
    }

    const { error } = await supabase
        .from('accounts')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/accounts')
    revalidatePath('/cards')
    revalidatePath('/transactions')
    return { success: true }
}

export async function deleteAccount(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check if account has transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('id')
        .or(`account_id.eq.${id},destination_account_id.eq.${id}`)
        .limit(1)

    if (transactions && transactions.length > 0) {
        // Soft delete instead
        const { error } = await supabase
            .from('accounts')
            .update({ is_active: false })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) return { error: error.message }
    } else {
        // Hard delete if no transactions
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) return { error: error.message }
    }

    revalidatePath('/accounts')
    revalidatePath('/cards')
    return { success: true }
}

export async function setDefaultAccount(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Remove default from all accounts
    await supabase
        .from('accounts')
        .update({ is_default: false })
        .eq('user_id', user.id)

    // Set new default
    const { error } = await supabase
        .from('accounts')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/accounts')
    return { success: true }
}

// =============================================
// PAYMENTS (Credit Card specific)
// =============================================

export async function payAccount(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const account_id = formData.get('account_id') as string
    const source_account_id = formData.get('source_account_id') as string || null
    const amount = parseFloat(formData.get('amount') as string)

    if (!amount || amount <= 0) {
        return { error: 'El monto debe ser mayor a cero.' }
    }

    // Get the payment transaction type
    const payment_type_id = await getTransactionTypeId(supabase, 'payment')
    if (!payment_type_id) return { error: 'Tipo de transacción no encontrado.' }

    // Create payment transaction
    const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        transaction_type_id: payment_type_id,
        amount,
        description: 'Pago de tarjeta de crédito',
        account_id: account_id,
        date: new Date().toISOString().split('T')[0],
    })

    if (txError) return { error: txError.message }

    // Reduce credit card balance (debt)
    const { data: account } = await supabase
        .from('accounts')
        .select('current_balance')
        .eq('id', account_id)
        .single()

    if (account) {
        const newBalance = Math.max(0, Number(account.current_balance) - amount)
        await supabase
            .from('accounts')
            .update({ current_balance: newBalance })
            .eq('id', account_id)
    }

    // If paid from another account, reduce that account's balance
    if (source_account_id) {
        const { data: sourceAccount } = await supabase
            .from('accounts')
            .select('current_balance')
            .eq('id', source_account_id)
            .single()

        if (sourceAccount) {
            const newSourceBalance = Number(sourceAccount.current_balance) - amount
            await supabase
                .from('accounts')
                .update({ current_balance: newSourceBalance })
                .eq('id', source_account_id)
        }
    }

    revalidatePath('/accounts')
    revalidatePath('/cards')
    revalidatePath('/')
    return { success: true }
}

// =============================================
// DATA FETCHING
// =============================================

export async function getAccountTypes() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('account_types')
        .select('*')
        .order('code')

    if (error) return { error: error.message }
    return { data }
}

export async function getCardIssuers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('card_issuers')
        .select('*')
        .order('name')

    if (error) return { error: error.message }
    return { data }
}

export async function getCurrencies() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('code')

    if (error) return { error: error.message }
    return { data }
}

export async function getAccounts(options?: { type?: string; active_only?: boolean }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    let query = supabase
        .from('accounts')
        .select('*, account_types(code, name, allows_credit), currencies(code, symbol), card_issuers(name)')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('name')

    if (options?.active_only !== false) {
        query = query.eq('is_active', true)
    }

    if (options?.type) {
        const typeId = await getAccountTypeId(supabase, options.type)
        if (typeId) {
            query = query.eq('account_type_id', typeId)
        }
    }

    const { data, error } = await query

    if (error) return { error: error.message }
    return { data }
}

export async function getCreditCards() {
    // Convenience method for backwards compatibility
    return getAccounts({ type: 'credit_card' })
}

// =============================================
// LEGACY SUPPORT (Para compatibilidad temporal)
// =============================================

/** @deprecated Use createAccount instead */
export async function createCreditCard(formData: FormData) {
    formData.set('account_type', 'credit_card')
    formData.set('initial_balance', '0')
    return createAccount(formData)
}

/** @deprecated Use updateAccount instead */
export async function updateCreditCard(id: string, formData: FormData) {
    return updateAccount(id, formData)
}

/** @deprecated Use deleteAccount instead */
export async function deleteCreditCard(id: string) {
    return deleteAccount(id)
}

/** @deprecated Use payAccount instead */
export async function payCreditCard(formData: FormData) {
    const cardId = formData.get('card_id') as string
    formData.set('account_id', cardId)
    return payAccount(formData)
}
