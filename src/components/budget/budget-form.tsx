'use client'

import { useState } from 'react'
import { setBudget } from '@/app/(dashboard)/budget/actions'

export function BudgetForm({ categories }: { categories: any[] }) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        await setBudget(formData)
        setLoading(false)
        const form = document.getElementById('budget-form') as HTMLFormElement
        if (form) form.reset()
    }

    return (
        <div className="glass-card p-6 rounded-xl h-fit">
            <h3 className="text-lg font-semibold mb-6">Configurar Presupuesto</h3>
            <form id="budget-form" action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select name="category_id" className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm" required>
                        <option value="global" className="bg-zinc-900 text-white">Global (Todos los Gastos)</option>
                        {categories?.map(c => (
                            <option key={c.id} value={c.id} className="bg-zinc-900 text-white">{c.name}</option>
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
                            placeholder="500.00"
                            className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg text-sm"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : 'Guardar Presupuesto'}
                </button>
            </form>
        </div>
    )
}
