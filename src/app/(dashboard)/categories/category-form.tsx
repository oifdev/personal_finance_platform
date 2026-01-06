'use client'

import { useState } from 'react'
import { IconPicker } from '@/components/ui/icon-picker'
import { createCategory } from './actions'

const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
]

export function CategoryForm() {
    const [icon, setIcon] = useState('Wallet')
    const [color, setColor] = useState(COLORS[3]) // Emerald by default
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('icon', icon)
        formData.append('color', color)

        await createCategory(formData)
        setLoading(false);
        // Reset form logic
        (document.getElementById('category-form') as HTMLFormElement).reset()
    }

    return (
        <div className="glass-card p-6 rounded-xl h-fit">
            <h3 className="text-lg font-semibold mb-6">Agregar Nueva Categoría</h3>
            <form id="category-form" action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="type" value="income" className="accent-primary" defaultChecked />
                            <span className="text-sm">Ingreso</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="type" value="expense" className="accent-primary" />
                            <span className="text-sm">Gasto</span>
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
                        placeholder="Ej. Compras"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                </div>

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
                    className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Agregando...' : 'Agregar Categoría'}
                </button>
            </form>
        </div>
    )
}
