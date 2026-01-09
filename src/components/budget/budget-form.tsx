'use client'

import { useState } from 'react'
import { setBudget } from '@/app/(dashboard)/budget/actions'

interface BudgetFormProps {
    categories: any[]
    initialData?: any
    onCancel?: () => void
}

export function BudgetForm({ categories, initialData, onCancel }: BudgetFormProps) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        // Ensure category_id handles null for global/initialData
        if (!formData.get('category_id') && initialData?.category_id === null) {
            formData.append('category_id', 'global')
        }

        await setBudget(formData)
        setLoading(false)

        if (initialData && onCancel) {
            onCancel()
        } else {
            const form = document.getElementById('budget-form') as HTMLFormElement
            if (form) form.reset()
        }
    }

    return (
        <div className="glass-card p-6 rounded-xl h-fit">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">{initialData ? 'Editar Presupuesto' : 'Configurar Presupuesto'}</h3>
                {initialData && (
                    <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-white">
                        Cancelar
                    </button>
                )}
            </div>

            <form id="budget-form" action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                        name="category_id"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                        required
                        defaultValue={initialData?.category_id || 'global'}
                    >
                        <option value="global" className="bg-surface text-foreground">Global (Todos los Gastos)</option>
                        {categories?.map(c => (
                            <option key={c.id} value={c.id} className="bg-surface text-foreground">{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Límite Mensual (L)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground/50">L</span>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            defaultValue={initialData?.amount}
                            placeholder="500.00"
                            className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : initialData ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}
                </button>
            </form>
        </div>
    )
}
