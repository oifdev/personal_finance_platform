'use client'

import { useState } from 'react'
import { IconPicker } from '@/components/ui/icon-picker'
import { createCategory, updateCategory } from './actions'
import type { CategoryType, Category } from '@/types/database'

const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
]

interface CategoryFormProps {
    initialData?: any
    categoryTypes?: any[]
    categories?: any[] // For parent category selection
    onCancel?: () => void
}

export function CategoryForm({ initialData, categoryTypes = [], categories = [], onCancel }: CategoryFormProps) {
    const [icon, setIcon] = useState(initialData?.icon || 'Wallet')
    const [color, setColor] = useState(initialData?.color || COLORS[3])
    const [loading, setLoading] = useState(false)
    const [selectedType, setSelectedType] = useState(
        initialData?.category_types?.code || initialData?.type || 'income'
    )

    // Filter categories for parent selection (same type, not self, no children of self)
    const availableParents = categories.filter(c => {
        const typeCode = c.category_types?.code || c.type
        return typeCode === selectedType &&
            c.id !== initialData?.id &&
            !c.parent_category_id // Only top-level categories can be parents
    })

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('icon', icon)
        formData.append('color', color)

        if (initialData) {
            await updateCategory(initialData.id, formData)
            if (onCancel) onCancel()
        } else {
            await createCategory(formData)
            // Reset form
            setIcon('Wallet')
            setColor(COLORS[3])
            const form = document.getElementById('category-form') as HTMLFormElement
            form?.reset()
        }
        setLoading(false)
    }

    return (
        <div className="glass-card p-6 rounded-xl h-fit">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">{initialData ? 'Editar Categoría' : 'Agregar Nueva Categoría'}</h3>
                {initialData && (
                    <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-white">
                        Cancelar
                    </button>
                )}
            </div>

            <form id="category-form" action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="income"
                                className="accent-primary"
                                checked={selectedType === 'income'}
                                onChange={() => setSelectedType('income')}
                            />
                            <span className="text-sm text-emerald-500">Ingreso</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="expense"
                                className="accent-primary"
                                checked={selectedType === 'expense'}
                                onChange={() => setSelectedType('expense')}
                            />
                            <span className="text-sm text-rose-500">Gasto</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">Nombre</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        defaultValue={initialData?.name}
                        placeholder="Ej. Compras"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50 text-sm text-foreground"
                    />
                </div>

                {/* Parent Category Selection */}
                {availableParents.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Categoría Padre (Opcional)</label>
                        <select
                            name="parent_category_id"
                            defaultValue={initialData?.parent_category_id || ''}
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50 text-sm text-foreground"
                        >
                            <option value="" className="bg-surface text-foreground">Sin categoría padre</option>
                            {availableParents.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-surface text-foreground">
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Las subcategorías ayudan a organizar mejor tus finanzas.
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Ícono</label>
                    <IconPicker value={icon} onChange={setIcon} />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : initialData ? 'Actualizar Categoría' : 'Agregar Categoría'}
                </button>
            </form>
        </div>
    )
}
