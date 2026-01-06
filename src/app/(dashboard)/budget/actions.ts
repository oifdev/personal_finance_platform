'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
