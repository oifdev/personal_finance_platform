'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TransactionFormData, Transaction, Account, TransactionType } from '@/types/database'

// =============================================
// HELPERS
// =============================================

async function getTransactionTypeId(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, code: string): Promise<string | null> {
    const { data } = await supabase
        .from('transaction_types')
        .select('id')
        .eq('code', code)
        .single()
    return data?.id || null
}

async function updateAccountBalance(
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
    accountId: string,
    amount: number,
    operation: 'add' | 'subtract'
) {
    const { data: account } = await supabase
        .from('accounts')
        .select('current_balance')
        .eq('id', accountId)
        .single()

    if (account) {
        const newBalance = operation === 'add'
            ? Number(account.current_balance) + amount
            : Number(account.current_balance) - amount

        await supabase
            .from('accounts')
            .update({ current_balance: newBalance })
            .eq('id', accountId)
    }
}

// =============================================
// CRUD OPERATIONS
// =============================================

export async function createTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const typeCode = formData.get('type') as string // 'income', 'expense', 'transfer', 'payment'
    const category_id = formData.get('category_id') as string || null
    const account_id = formData.get('account_id') as string || null
    const destination_account_id = formData.get('destination_account_id') as string || null
    const tagsRaw = formData.get('tags') as string
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : null

    // Resolve transaction_type_id from code
    const transaction_type_id = await getTransactionTypeId(supabase, typeCode)
    if (!transaction_type_id) return { error: `Tipo de transacción inválido: ${typeCode}` }

    // Validate based on type
    if (typeCode === 'expense' && !category_id) {
        return { error: 'La categoría es requerida para gastos.' }
    }
    if (typeCode === 'income' && !category_id) {
        return { error: 'La categoría es requerida para ingresos.' }
    }
    if (typeCode === 'transfer' && (!account_id || !destination_account_id)) {
        return { error: 'Las cuentas de origen y destino son requeridas para transferencias.' }
    }

    const payload = {
        user_id: user.id,
        transaction_type_id,
        amount,
        description,
        date,
        category_id: category_id || null,
        account_id: account_id && account_id !== 'none' ? account_id : null,
        destination_account_id: (typeCode === 'transfer' && destination_account_id) ? destination_account_id : null,
        tags: tags && tags.length > 0 ? tags : null,
    }

    const { error } = await supabase.from('transactions').insert(payload)
    if (error) return { error: error.message }

    // Update account balances based on transaction type
    if (account_id && account_id !== 'none') {
        if (typeCode === 'expense' || typeCode === 'payment') {
            // Get account type to determine if it's credit card
            const { data: accountData } = await supabase
                .from('accounts')
                .select('account_type_id, account_types(code)')
                .eq('id', account_id)
                .single()

            const accountTypeCode = (accountData?.account_types as any)?.code

            if (accountTypeCode === 'credit_card') {
                // Credit card: expense INCREASES the balance (debt)
                await updateAccountBalance(supabase, account_id, amount, 'add')
            } else {
                // Cash/Bank: expense DECREASES the balance
                await updateAccountBalance(supabase, account_id, amount, 'subtract')
            }
        } else if (typeCode === 'income') {
            // Income: INCREASES the balance
            await updateAccountBalance(supabase, account_id, amount, 'add')
        } else if (typeCode === 'transfer') {
            // Transfer: subtract from origin, add to destination
            await updateAccountBalance(supabase, account_id, amount, 'subtract')
            if (destination_account_id) {
                await updateAccountBalance(supabase, destination_account_id, amount, 'add')
            }
        }
    }

    revalidatePath('/transactions')
    revalidatePath('/')
    revalidatePath('/accounts')
    return { success: true }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()

    // Get transaction first to revert balance
    const { data: tx } = await supabase
        .from('transactions')
        .select('*, transaction_types(code), accounts(account_types(code))')
        .eq('id', id)
        .single()

    if (!tx) return { error: 'Transacción no encontrada.' }

    // Delete
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) return { error: error.message }

    // Revert balance effects
    const typeCode = (tx.transaction_types as any)?.code

    if (tx.account_id) {
        const accountTypeCode = (tx.accounts as any)?.account_types?.code

        if (typeCode === 'expense' || typeCode === 'payment') {
            if (accountTypeCode === 'credit_card') {
                await updateAccountBalance(supabase, tx.account_id, Number(tx.amount), 'subtract')
            } else {
                await updateAccountBalance(supabase, tx.account_id, Number(tx.amount), 'add')
            }
        } else if (typeCode === 'income') {
            await updateAccountBalance(supabase, tx.account_id, Number(tx.amount), 'subtract')
        } else if (typeCode === 'transfer' && tx.destination_account_id) {
            await updateAccountBalance(supabase, tx.account_id, Number(tx.amount), 'add')
            await updateAccountBalance(supabase, tx.destination_account_id, Number(tx.amount), 'subtract')
        }
    }

    revalidatePath('/transactions')
    revalidatePath('/')
    revalidatePath('/accounts')
    return { success: true }
}

export async function updateTransaction(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const typeCode = formData.get('type') as string
    const category_id = formData.get('category_id') as string || null
    const account_id = formData.get('account_id') as string || null
    const destination_account_id = formData.get('destination_account_id') as string || null

    const transaction_type_id = await getTransactionTypeId(supabase, typeCode)
    if (!transaction_type_id) return { error: `Tipo de transacción inválido: ${typeCode}` }

    // 1. Get old transaction to revert its effects
    const { data: oldTx } = await supabase
        .from('transactions')
        .select('*, transaction_types(code), accounts(account_types(code))')
        .eq('id', id)
        .single()

    if (!oldTx) return { error: 'Transacción no encontrada.' }

    // 2. Revert old balance effects
    const oldTypeCode = (oldTx.transaction_types as any)?.code
    if (oldTx.account_id) {
        const oldAccountTypeCode = (oldTx.accounts as any)?.account_types?.code
        if (oldTypeCode === 'expense' || oldTypeCode === 'payment') {
            if (oldAccountTypeCode === 'credit_card') {
                await updateAccountBalance(supabase, oldTx.account_id, Number(oldTx.amount), 'subtract')
            } else {
                await updateAccountBalance(supabase, oldTx.account_id, Number(oldTx.amount), 'add')
            }
        } else if (oldTypeCode === 'income') {
            await updateAccountBalance(supabase, oldTx.account_id, Number(oldTx.amount), 'subtract')
        } else if (oldTypeCode === 'transfer' && oldTx.destination_account_id) {
            await updateAccountBalance(supabase, oldTx.account_id, Number(oldTx.amount), 'add')
            await updateAccountBalance(supabase, oldTx.destination_account_id, Number(oldTx.amount), 'subtract')
        }
    }

    // 3. Update transaction
    const payload = {
        transaction_type_id,
        amount,
        description,
        date,
        category_id: category_id || null,
        account_id: account_id && account_id !== 'none' ? account_id : null,
        destination_account_id: (typeCode === 'transfer' && destination_account_id) ? destination_account_id : null,
    }

    const { error } = await supabase.from('transactions').update(payload).eq('id', id)
    if (error) return { error: error.message }

    // 4. Apply new balance effects
    if (payload.account_id) {
        const { data: newAccountData } = await supabase
            .from('accounts')
            .select('account_types(code)')
            .eq('id', payload.account_id)
            .single()

        const newAccountTypeCode = (newAccountData?.account_types as any)?.code

        if (typeCode === 'expense' || typeCode === 'payment') {
            if (newAccountTypeCode === 'credit_card') {
                await updateAccountBalance(supabase, payload.account_id, amount, 'add')
            } else {
                await updateAccountBalance(supabase, payload.account_id, amount, 'subtract')
            }
        } else if (typeCode === 'income') {
            await updateAccountBalance(supabase, payload.account_id, amount, 'add')
        } else if (typeCode === 'transfer' && payload.destination_account_id) {
            await updateAccountBalance(supabase, payload.account_id, amount, 'subtract')
            await updateAccountBalance(supabase, payload.destination_account_id, amount, 'add')
        }
    }

    revalidatePath('/transactions')
    revalidatePath('/')
    revalidatePath('/accounts')
    return { success: true }
}

// =============================================
// DATA FETCHING (For UI Components)
// =============================================

export async function getTransactionTypes() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('transaction_types')
        .select('*')
        .order('code')

    if (error) return { error: error.message }
    return { data }
}

export async function getAccounts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('accounts')
        .select('*, account_types(code, name), currencies(symbol)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}
