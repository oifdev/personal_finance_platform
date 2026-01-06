'use client'

import { useState } from 'react'
import { createTransaction, updateTransaction } from '@/app/(dashboard)/transactions/actions'
import * as Icons from 'lucide-react'

// Props: list of categories and credit cards passed from Server Component
interface TransactionFormProps {
    categories: any[]
    creditCards: any[]
    initialData?: any
    onCancel?: () => void
}

export function TransactionForm({ categories, creditCards, initialData, onCancel }: TransactionFormProps) {
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState(initialData?.type || 'expense') // 'income' or 'expense'

    const filteredCategories = categories.filter(c => c.type === type)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('type', type)

        if (initialData) {
            // Check if credit card needs to be explicitly set to 'none' if null in update
            // Using logic in actions.ts to handle 'none' string or null
            await updateTransaction(initialData.id, formData)
            if (onCancel) onCancel()
        } else {
            await createTransaction(formData)
            // Reset form
            setType('expense');
            (document.getElementById('transaction-form') as HTMLFormElement).reset()
        }

        setLoading(false)
    }

    return (
        <div className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">{initialData ? 'Editar Transacción' : 'Agregar Transacción'}</h3>
                {initialData && (
                    <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-white">
                        Cancelar
                    </button>
                )}
            </div>

            <form id="transaction-form" action={handleSubmit} className="space-y-6">

                {/* Type Toggle */}
                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-white'}`}
                    >
                        Ingreso
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:text-white'}`}
                    >
                        Gasto
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Monto</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">L</span>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            defaultValue={initialData?.amount}
                            placeholder="0.00"
                            className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <input
                        name="description"
                        type="text"
                        defaultValue={initialData?.description}
                        placeholder={type === 'income' ? "¿De qué es este ingreso?" : "¿En qué gastaste?"}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha</label>
                        <input
                            name="date"
                            type="date"
                            defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                            required
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Categoría</label>
                        <select
                            name="category_id"
                            required
                            defaultValue={initialData?.category_id}
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        >
                            <option value="" className="bg-zinc-900 text-white">Seleccionar...</option>
                            {filteredCategories.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Only show credit card option for Expenses */}
                {type === 'expense' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Método de Pago</label>
                        <select
                            name="credit_card_id"
                            defaultValue={initialData?.credit_card_id || 'none'}
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        >
                            <option value="none" className="bg-zinc-900 text-white">Efectivo / Débito</option>
                            {creditCards.map(card => (
                                <option key={card.id} value={card.id} className="bg-zinc-900 text-white">
                                    {card.name} (..{card.last_4_digits})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 ${type === 'income' ? 'bg-primary hover:bg-emerald-600 text-primary-foreground' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                    {loading ? 'Guardando...' : initialData ? 'Actualizar Transacción' : (type === 'income' ? 'Agregar Ingreso' : 'Agregar Gasto')}
                </button>
            </form>
        </div>
    )
}
