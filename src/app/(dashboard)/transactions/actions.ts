'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const type = formData.get('type') as string
    const category_id = formData.get('category_id') as string // UUID
    const credit_card_id = formData.get('credit_card_id') as string || null // UUID or null

    if (!category_id) return { error: 'Category is required' }

    const payload = {
        user_id: user.id,
        amount,
        description,
        date,
        type,
        category_id,
        credit_card_id: credit_card_id === 'none' ? null : credit_card_id
    }

    const { error } = await supabase.from('transactions').insert(payload)

    if (error) return { error: error.message }

    // If using credit card, update its balance
    if (type === 'expense' && credit_card_id && credit_card_id !== 'none') {
        // Fetch current balance
        const { data: card } = await supabase.from('credit_cards').select('current_balance').eq('id', credit_card_id).single()
        if (card) {
            const newBalance = Number(card.current_balance) + amount
            await supabase.from('credit_cards').update({ current_balance: newBalance }).eq('id', credit_card_id)
        }
    }

    revalidatePath('/transactions')
    revalidatePath('/') // Update dashboard too
    revalidatePath('/cards')
    return { success: true }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()
    // Need to handle reversing credit card balance if deleting an expense.
    // For simplicity given complexity constraints, we will just delete for now or do a simple check.
    // Ideally use a database trigger or transaction.

    // Get transaction first
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single()
    if (!tx) return { error: 'Transaction not found' }

    // Delete
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) return { error: error.message }

    // Revert balance if credit card was used
    if (tx.type === 'expense' && tx.credit_card_id) {
        const { data: card } = await supabase.from('credit_cards').select('current_balance').eq('id', tx.credit_card_id).single()
        if (card) {
            const newBalance = Number(card.current_balance) - Number(tx.amount)
            await supabase.from('credit_cards').update({ current_balance: newBalance }).eq('id', tx.credit_card_id)
        }
    }

    revalidatePath('/transactions')
    revalidatePath('/')
    return { success: true }
}
