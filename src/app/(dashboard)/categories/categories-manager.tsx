'use client'

import { useState } from 'react'
import { CategoryForm } from './category-form'
import { CategoryList } from './category-list'

export function CategoriesManager({ categories }: { categories: any[] }) {
    const [editingCategory, setEditingCategory] = useState<any | null>(null)

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <CategoryForm
                initialData={editingCategory}
                onCancel={() => setEditingCategory(null)}
                key={editingCategory?.id || 'new'} // Force re-render when switching edit mode
            />

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Categorías Existentes</h3>
                <CategoryList
                    categories={categories}
                    onEdit={setEditingCategory}
                />
            </div>
        </div>
    )
}
