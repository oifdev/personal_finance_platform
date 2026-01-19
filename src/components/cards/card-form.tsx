'use client'

import { useState, useEffect } from 'react'
import { createAccount, updateAccount } from '@/app/(dashboard)/accounts/actions'
import { Plus, CreditCard, Landmark, Wallet, PiggyBank, TrendingUp } from 'lucide-react'
import type { AccountType, CardIssuer, Currency } from '@/types/database'

interface AccountFormProps {
    initialData?: any
    accountTypes?: AccountType[]
    cardIssuers?: CardIssuer[]
    currencies?: Currency[]
    onCancel?: () => void
    defaultType?: string
}

const ACCOUNT_TYPE_ICONS: Record<string, typeof CreditCard> = {
    cash: Wallet,
    bank: Landmark,
    credit_card: CreditCard,
    savings: PiggyBank,
    investment: TrendingUp,
}

export function AccountForm({ initialData, accountTypes = [], cardIssuers = [], currencies = [], onCancel, defaultType = 'credit_card' }: AccountFormProps) {
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedType, setSelectedType] = useState(defaultType)

    useEffect(() => {
        if (initialData) {
            setIsOpen(true)
            // Get the type code from initial data
            const typeCode = initialData.account_types?.code || defaultType
            setSelectedType(typeCode)
        }
    }, [initialData, defaultType])

    const isCreditCard = selectedType === 'credit_card'

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.set('account_type', selectedType)

        if (initialData) {
            await updateAccount(initialData.id, formData)
            if (onCancel) onCancel()
        } else {
            await createAccount(formData)
        }
        setLoading(false)
        setIsOpen(false)
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
                Agregar Cuenta
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md glass-card p-6 rounded-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-6">
                    {initialData ? 'Editar Cuenta' : 'Agregar Nueva Cuenta'}
                </h3>

                <form action={handleSubmit} className="space-y-4">
                    {/* Account Type Selector */}
                    {!initialData && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo de Cuenta</label>
                            <div className="grid grid-cols-3 gap-2">
                                {accountTypes.map(type => {
                                    const Icon = ACCOUNT_TYPE_ICONS[type.code] || Wallet
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setSelectedType(type.code)}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${selectedType === type.code
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border hover:border-muted-foreground'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="text-xs">{type.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre de la Cuenta</label>
                        <input
                            name="name"
                            defaultValue={initialData?.name}
                            required
                            placeholder={isCreditCard ? "Visa Gold" : "Mi cuenta de banco"}
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                        />
                    </div>

                    {/* Currency selector */}
                    {!initialData && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Moneda</label>
                            <select
                                name="currency"
                                defaultValue="HNL"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                            >
                                {currencies.map(currency => (
                                    <option key={currency.id} value={currency.code} className="bg-surface text-foreground">
                                        {currency.symbol} - {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Initial balance - only for new non-credit accounts */}
                    {!initialData && !isCreditCard && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Saldo Inicial</label>
                            <input
                                name="initial_balance"
                                type="number"
                                step="0.01"
                                defaultValue="0"
                                placeholder="0.00"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                            />
                        </div>
                    )}

                    {/* Credit card specific fields */}
                    {isCreditCard && (
                        <>
                            {cardIssuers.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Emisor</label>
                                    <select
                                        name="card_issuer_id"
                                        defaultValue={initialData?.card_issuer_id || ''}
                                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                                    >
                                        <option value="" className="bg-surface text-foreground">Seleccionar...</option>
                                        {cardIssuers.map(issuer => (
                                            <option key={issuer.id} value={issuer.id} className="bg-surface text-foreground">
                                                {issuer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Últimos 4 Dígitos</label>
                                <input
                                    name="last_4_digits"
                                    defaultValue={initialData?.last_4_digits}
                                    placeholder="1234"
                                    maxLength={4}
                                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Límite de Crédito</label>
                                <input
                                    name="credit_limit"
                                    type="number"
                                    step="0.01"
                                    defaultValue={initialData?.credit_limit}
                                    required={isCreditCard}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Día de Corte</label>
                                    <input
                                        name="cutoff_day"
                                        type="number"
                                        min="1"
                                        max="31"
                                        defaultValue={initialData?.cutoff_day}
                                        placeholder="5"
                                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Día de Pago</label>
                                    <input
                                        name="payment_day"
                                        type="number"
                                        min="1"
                                        max="31"
                                        defaultValue={initialData?.payment_day}
                                        placeholder="20"
                                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notas (opcional)</label>
                        <input
                            name="notes"
                            defaultValue={initialData?.notes}
                            placeholder="Notas adicionales..."
                            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Legacy export for backwards compatibility
export { AccountForm as CardForm }
