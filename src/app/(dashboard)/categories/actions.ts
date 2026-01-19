'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CategoryFormData, Category, CategoryType } from '@/types/database'

// =============================================
// HELPERS
// =============================================

async function getCategoryTypeId(
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
    code: 'income' | 'expense'
): Promise<string | null> {
    const { data } = await supabase
        .from('category_types')
        .select('id')
        .eq('code', code)
        .single()
    return data?.id || null
}

// =============================================
// CRUD OPERATIONS
// =============================================

export async function createCategory(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const typeCode = formData.get('type') as 'income' | 'expense'
    const icon = formData.get('icon') as string
    const color = formData.get('color') as string
    const parent_category_id = formData.get('parent_category_id') as string || null

    // Resolve type_id from code
    const type_id = await getCategoryTypeId(supabase, typeCode)
    if (!type_id) return { error: `Tipo de categoría inválido: ${typeCode}` }

    const { error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            type_id,
            name,
            icon,
            color,
            parent_category_id: parent_category_id || null,
        })

    if (error) return { error: error.message }

    revalidatePath('/categories')
    revalidatePath('/transactions')
    revalidatePath('/budget')
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()

    // Check if category has subcategories
    const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_category_id', id)
        .limit(1)

    if (subcategories && subcategories.length > 0) {
        return { error: 'No se puede eliminar una categoría que tiene subcategorías.' }
    }

    // Check if category is used in transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .limit(1)

    if (transactions && transactions.length > 0) {
        return { error: 'No se puede eliminar una categoría que tiene transacciones asociadas.' }
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/categories')
    return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const typeCode = formData.get('type') as 'income' | 'expense'
    const icon = formData.get('icon') as string
    const color = formData.get('color') as string
    const parent_category_id = formData.get('parent_category_id') as string || null

    // Resolve type_id from code
    const type_id = await getCategoryTypeId(supabase, typeCode)
    if (!type_id) return { error: `Tipo de categoría inválido: ${typeCode}` }

    // Prevent circular reference
    if (parent_category_id === id) {
        return { error: 'Una categoría no puede ser su propia subcategoría.' }
    }

    const { error } = await supabase
        .from('categories')
        .update({
            type_id,
            name,
            icon,
            color,
            parent_category_id: parent_category_id || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/categories')
    revalidatePath('/transactions')
    revalidatePath('/budget')
    return { success: true }
}

// =============================================
// DATA FETCHING
// =============================================

export async function getCategoryTypes() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('category_types')
        .select('*')
        .order('code')

    if (error) return { error: error.message }
    return { data }
}

export async function getCategories(typeCode?: 'income' | 'expense') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    let query = supabase
        .from('categories')
        .select('*, category_types(code, name), parent_category:parent_category_id(id, name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order')

    if (typeCode) {
        // Need to filter by type code through the join
        const typeId = await getCategoryTypeId(supabase, typeCode)
        if (typeId) {
            query = query.eq('type_id', typeId)
        }
    }

    const { data, error } = await query

    if (error) return { error: error.message }
    return { data }
}

export async function getCategoriesHierarchy() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('categories')
        .select('*, category_types(code, name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('parent_category_id', null) // Only top-level categories
        .order('sort_order')

    if (error) return { error: error.message }

    // For each top-level category, fetch subcategories
    const categoriesWithChildren = await Promise.all(
        (data || []).map(async (category) => {
            const { data: subcategories } = await supabase
                .from('categories')
                .select('*, category_types(code, name)')
                .eq('parent_category_id', category.id)
                .eq('is_active', true)
                .order('sort_order')

            return {
                ...category,
                subcategories: subcategories || [],
            }
        })
    )

    return { data: categoriesWithChildren }
}
