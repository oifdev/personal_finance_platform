'use client'

import { useState } from 'react'
import { CategoryForm } from './category-form'
import { CategoryList } from './category-list'
import type { Category, CategoryType } from '@/types/database'

interface CategoriesManagerProps {
    categories: any[]
    categoryTypes: any[]
}

export function CategoriesManager({ categories, categoryTypes }: CategoriesManagerProps) {
    const [editingCategory, setEditingCategory] = useState<any | null>(null)

    // Separate categories by type for organized display
    const incomeCategories = categories.filter(c => c.category_types?.code === 'income')
    const expenseCategories = categories.filter(c => c.category_types?.code === 'expense')

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <CategoryForm
                initialData={editingCategory}
                categoryTypes={categoryTypes}
                categories={categories} // For parent category selection
                onCancel={() => setEditingCategory(null)}
                key={editingCategory?.id || 'new'}
            />

            <div className="space-y-6">
                {incomeCategories.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-emerald-500">Categorías de Ingreso</h3>
                        <CategoryList
                            categories={incomeCategories}
                            onEdit={setEditingCategory}
                        />
                    </div>
                )}

                {expenseCategories.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-rose-500">Categorías de Gasto</h3>
                        <CategoryList
                            categories={expenseCategories}
                            onEdit={setEditingCategory}
                        />
                    </div>
                )}

                {categories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground glass-card rounded-xl">
                        No hay categorías. Crea tu primera categoría arriba.
                    </div>
                )}
            </div>
        </div>
    )
}
