'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const icon = formData.get('icon') as string
    const color = formData.get('color') as string

    const { error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            name,
            type,
            icon,
            color
        })

    if (error) return { error: error.message }

    revalidatePath('/categories')
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/categories')
    return { success: true }
}
