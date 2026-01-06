'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCreditCard(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const last_4_digits = formData.get('last_4_digits') as string
    const limit = formData.get('limit')
    const cutoff_day = formData.get('cutoff_day')
    const payment_day = formData.get('payment_day')

    const { error } = await supabase.from('credit_cards').insert({
        user_id: user.id,
        name,
        last_4_digits,
        credit_limit: limit,
        cutoff_day,
        payment_day
    })

    if (error) return { error: error.message }
    revalidatePath('/cards')
    revalidatePath('/transactions')
    return { success: true }
}

export async function updateCreditCard(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const last_4_digits = formData.get('last_4_digits') as string
    const limit = formData.get('limit')
    const cutoff_day = formData.get('cutoff_day')
    const payment_day = formData.get('payment_day')

    const { error } = await supabase.from('credit_cards').update({
        name,
        last_4_digits,
        credit_limit: limit,
        cutoff_day,
        payment_day
    }).eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/cards')
    revalidatePath('/transactions')
    return { success: true }
}

export async function payCreditCard(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const card_id = formData.get('card_id') as string
    const amount = parseFloat(formData.get('amount') as string)

    // 1. Create a "Payment" transaction
    // Payments are outflows from user's perspective if paid from cache, OR separate records?
    // Usually "Credit Card Payment" is a Transfer.
    // For this app, let's just record it as a transaction type='payment'

    // Check if category "Debt Payment" exists or similar? Or just no category.
    // We will leave category null for payments or auto-assign?
    // Let's create a transaction.

    const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: amount,
        type: 'payment',
        description: 'Pago de tarjeta de crédito',
        credit_card_id: card_id,
        date: new Date().toISOString()
    })

    if (txError) return { error: txError.message }

    // 2. Reduce the card balance
    const { data: card } = await supabase.from('credit_cards').select('current_balance').eq('id', card_id).single()
    if (card) {
        const newBalance = Number(card.current_balance) - amount
        await supabase.from('credit_cards').update({ current_balance: newBalance }).eq('id', card_id)
    }

    revalidatePath('/cards')
    revalidatePath('/')
    return { success: true }
}

export async function deleteCreditCard(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('credit_cards').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/cards')
    return { success: true }
}
