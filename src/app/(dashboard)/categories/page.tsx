import { createClient } from '@/utils/supabase/server'
import { CategoriesManager } from './categories-manager'

export default async function CategoriesPage() {
    const supabase = await createClient()

    // Fetch categories with type relation
    const { data: categories } = await supabase
        .from('categories')
        .select('*, category_types(code, name), parent_category:parent_category_id(id, name)')
        .eq('is_active', true)
        .order('sort_order')
        .order('created_at', { ascending: false })

    // Fetch category types for the form
    const { data: categoryTypes } = await supabase
        .from('category_types')
        .select('*')
        .order('code')

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
                    <p className="text-muted-foreground mt-1">Gestione sus categorías de ingresos y gastos.</p>
                </div>
            </div>

            <CategoriesManager
                categories={categories || []}
                categoryTypes={categoryTypes || []}
            />
        </div>
    )
}
