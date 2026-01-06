'use client'

import { useState } from 'react'
import { createCreditCard } from '@/app/(dashboard)/cards/actions'
import { Plus } from 'lucide-react'

export function CardForm() {
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        await createCreditCard(formData)
        setLoading(false)
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-emerald-600 transition-colors"
            >
                <Plus className="h-4 w-4" />
                Agregar Nueva Tarjeta
            </button>
        )
    }

    return (
        <div className="glass-card p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-semibold mb-6">Agregar Tarjeta de Crédito</h3>
            <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre de la Tarjeta</label>
                    <input name="name" required placeholder="Visa Gold" className="w-full px-3 py-2 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Últimos 4 Dígitos</label>
                    <input name="last_4_digits" placeholder="1234" maxLength={4} className="w-full px-3 py-2 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Límite de Crédito (L)</label>
                    <input name="limit" type="number" step="0.01" required placeholder="0.00" className="w-full px-3 py-2 bg-input border border-border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Día de Corte</label>
                        <input name="cutoff_day" type="number" min="1" max="31" placeholder="Día (5)" className="w-full px-3 py-2 bg-input border border-border rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Día de Pago</label>
                        <input name="payment_day" type="number" min="1" max="31" placeholder="Día (20)" className="w-full px-3 py-2 bg-input border border-border rounded-lg" />
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-white">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                        {loading ? 'Agregando...' : 'Guardar Tarjeta'}
                    </button>
                </div>
            </form>
        </div>
    )
}
