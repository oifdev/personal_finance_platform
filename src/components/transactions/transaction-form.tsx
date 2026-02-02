'use client'

import { useState } from 'react'
import { createTransaction, updateTransaction } from '@/app/dashboard/transactions/actions'
import type { Category, Account, TransactionType } from '@/types/database'

// Props: list of categories and accounts passed from Server Component
interface TransactionFormProps {
    categories: Category[]
    accounts: Account[]
    transactionTypes?: TransactionType[]
    initialData?: any
    onCancel?: () => void
}

export function TransactionForm({ categories, accounts, transactionTypes, initialData, onCancel }: TransactionFormProps) {
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState(initialData?.transaction_types?.code || initialData?.type || 'expense')
    const [showTransfer, setShowTransfer] = useState(type === 'transfer')

    // Filter categories by type
    // Categories now have type_id with a relation to category_types
    const filteredCategories = categories.filter(c => {
        const categoryTypeCode = (c as any).category_types?.code || (c as any).type
        return categoryTypeCode === type
    })

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('type', type)

        if (initialData) {
            await updateTransaction(initialData.id, formData)
            if (onCancel) onCancel()
        } else {
            await createTransaction(formData)
            // Reset form
            setType('expense')
            setShowTransfer(false);
            (document.getElementById('transaction-form') as HTMLFormElement)?.reset()
        }

        setLoading(false)
    }

    const handleTypeChange = (newType: string) => {
        setType(newType)
        setShowTransfer(newType === 'transfer')
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
                        onClick={() => handleTypeChange('income')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-[#f1d77a] text-zinc-900 shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Ingreso
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange('expense')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-[#f1d77a] text-zinc-900 shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Gasto
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange('transfer')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'transfer' ? 'bg-[#38b6ff] text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Transferencia
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
                            min="0.01"
                            required
                            defaultValue={initialData?.amount}
                            placeholder="0.00"
                            className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <input
                        name="description"
                        type="text"
                        defaultValue={initialData?.description}
                        placeholder={
                            type === 'income' ? "¿De qué es este ingreso?" :
                                type === 'transfer' ? "¿Para qué es esta transferencia?" :
                                    "¿En qué gastaste?"
                        }
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground"
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
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground"
                        />
                    </div>

                    {/* Category selector - only for income/expense */}
                    {(type === 'income' || type === 'expense') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categoría</label>
                            <select
                                name="category_id"
                                required
                                defaultValue={initialData?.category_id}
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50 text-sm text-foreground"
                            >
                                <option value="" className="bg-surface text-foreground">Seleccionar...</option>
                                {filteredCategories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-surface text-foreground">
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Account selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {type === 'transfer' ? 'Cuenta Origen' : 'Cuenta / Método de Pago'}
                    </label>
                    <select
                        name="account_id"
                        defaultValue={initialData?.account_id || 'none'}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50 text-sm text-foreground"
                    >
                        <option value="none" className="bg-surface text-foreground">Sin especificar</option>
                        {accounts.map(account => {
                            const accountType = (account as any).account_types?.code
                            const currencySymbol = (account as any).currencies?.symbol || 'L'
                            const displayName = accountType === 'credit_card' && account.last_4_digits
                                ? `${account.name} (..${account.last_4_digits})`
                                : account.name

                            return (
                                <option key={account.id} value={account.id} className="bg-surface text-foreground">
                                    {displayName} - {currencySymbol}{Number(account.current_balance).toFixed(2)}
                                </option>
                            )
                        })}
                    </select>
                </div>

                {/* Destination account for transfers */}
                {showTransfer && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cuenta Destino</label>
                        <select
                            name="destination_account_id"
                            required={type === 'transfer'}
                            defaultValue={initialData?.destination_account_id}
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50 text-sm text-foreground"
                        >
                            <option value="" className="bg-surface text-foreground">Seleccionar destino...</option>
                            {accounts.map(account => {
                                const currencySymbol = (account as any).currencies?.symbol || 'L'
                                return (
                                    <option key={account.id} value={account.id} className="bg-surface text-foreground">
                                        {account.name} - {currencySymbol}{Number(account.current_balance).toFixed(2)}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                    {loading ? 'Guardando...' : initialData ? 'Actualizar Transacción' : (
                        type === 'income' ? 'Agregar Ingreso' :
                            type === 'transfer' ? 'Realizar Transferencia' :
                                'Agregar Gasto'
                    )}
                </button>
            </form>
        </div>
    )
}
