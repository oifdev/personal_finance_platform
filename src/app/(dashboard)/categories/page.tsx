import { createClient } from '@/utils/supabase/server'
import { CategoryList } from './category-list'
import { CategoryForm } from './category-form'

export default async function CategoriesPage() {
    const supabase = await createClient()
    const { data: categories } = await supabase.from('categories').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
                    <p className="text-muted-foreground mt-1">Gestione sus categorías de ingresos y gastos.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <CategoryForm />

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Categorías Existentes</h3>
                    <CategoryList categories={categories || []} />
                </div>
            </div>
        </div>
    )
}
