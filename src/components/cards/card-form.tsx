'use client'

import { useState, useEffect } from 'react'
import { createCreditCard, updateCreditCard } from '@/app/(dashboard)/cards/actions'
import { Plus } from 'lucide-react'

interface CardFormProps {
    initialData?: any
    onCancel?: () => void
}

export function CardForm({ initialData, onCancel }: CardFormProps) {
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (initialData) {
            setIsOpen(true)
        }
    }, [initialData])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        if (initialData) {
            await updateCreditCard(initialData.id, formData)
            if (onCancel) onCancel()
        } else {
            await createCreditCard(formData)
        }
        setLoading(false)
        setIsOpen(false);
    }

    function handleCancel() {
        setIsOpen(false)
        if (onCancel) onCancel()
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20"
            >
                <Plus className="h-4 w-4" />
                Agregar Nueva Tarjeta
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md glass-card p-6 rounded-xl animate-in zoom-in-95">
                <h3 className="text-lg font-semibold mb-6">{initialData ? 'Editar Tarjeta' : 'Agregar Tarjeta de Crédito'}</h3>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre de la Tarjeta</label>
                        <input name="name" defaultValue={initialData?.name} required placeholder="Visa Gold" className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Últimos 4 Dígitos</label>
                        <input name="last_4_digits" defaultValue={initialData?.last_4_digits} placeholder="1234" maxLength={4} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Límite de Crédito (L)</label>
                        <input name="limit" type="number" step="0.01" defaultValue={initialData?.credit_limit} required placeholder="0.00" className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Día de Corte</label>
                            <input name="cutoff_day" type="number" min="1" max="31" defaultValue={initialData?.cutoff_day} placeholder="Día (5)" className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Día de Pago</label>
                            <input name="payment_day" type="number" min="1" max="31" defaultValue={initialData?.payment_day} placeholder="Día (20)" className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50" />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20 disabled:opacity-50">
                            {loading ? 'Guardando...' : initialData ? 'Actualizar Tarjeta' : 'Guardar Tarjeta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
