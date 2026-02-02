'use client'

import { useState } from 'react'
import { payAccount, deleteAccount, setDefaultAccount } from '@/app/dashboard/accounts/actions'
import { CreditCard, Trash2, Calendar, Pencil, Wallet, Landmark, PiggyBank, TrendingUp, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ConfirmModal } from '@/components/ui/confirm-modal'

const ACCOUNT_TYPE_ICONS: Record<string, typeof CreditCard> = {
    cash: Wallet,
    bank: Landmark,
    credit_card: CreditCard,
    savings: PiggyBank,
    investment: TrendingUp,
}

export function AccountList({ accounts, onEdit }: { accounts: any[], onEdit: (account: any) => void }) {
    const [deleteId, setDeleteId] = useState<string | null>(null)

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && deleteAccount(deleteId)}
                title="Eliminar Cuenta"
                description="¿Estás seguro de que deseas eliminar esta cuenta? Si tiene transacciones, será desactivada en lugar de eliminada."
                confirmText="Eliminar"
                isDanger
            />

            {accounts.map(account => {
                const accountTypeCode = account.account_types?.code || 'cash'
                const isCreditCard = accountTypeCode === 'credit_card'
                const Icon = ACCOUNT_TYPE_ICONS[accountTypeCode] || Wallet
                const currencySymbol = account.currencies?.symbol || 'L'

                return (
                    <div key={account.id} className="glass-card relative overflow-hidden rounded-xl p-6 transition-all hover:shadow-lg group">
                        {/* Visual Card Background Effect */}
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Default Badge */}
                        {account.is_default && (
                            <div className="absolute top-3 right-3">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="font-bold text-lg">{account.name}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {isCreditCard && account.last_4_digits
                                        ? `**** **** **** ${account.last_4_digits}`
                                        : account.account_types?.name
                                    }
                                </p>
                            </div>
                            <Icon className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {isCreditCard ? 'Saldo Actual (Deuda)' : 'Saldo'}
                                </p>
                                <p className={`text-2xl font-bold ${isCreditCard && Number(account.current_balance) > 0 ? 'text-rose-500' : ''}`}>
                                    {currencySymbol}{formatCurrency(Number(account.current_balance || 0)).replace('L', '')}
                                </p>
                            </div>

                            {isCreditCard && account.credit_limit && (
                                <div className="flex justify-between text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Límite</p>
                                        <p>{currencySymbol}{formatCurrency(Number(account.credit_limit || 0)).replace('L', '')}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Disponible</p>
                                        <p className="text-emerald-500">
                                            {currencySymbol}{formatCurrency(Number(account.credit_limit || 0) - Number(account.current_balance || 0)).replace('L', '')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                                {isCreditCard ? (
                                    <PayButton accountId={account.id} />
                                ) : (
                                    <button
                                        onClick={() => setDefaultAccount(account.id)}
                                        disabled={account.is_default}
                                        className={`flex-1 mr-4 text-sm font-medium py-2 rounded-lg transition-colors border ${account.is_default
                                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 cursor-default'
                                            : 'bg-white/5 hover:bg-white/10 border-white/10'
                                            }`}
                                    >
                                        {account.is_default ? 'Cuenta Principal' : 'Hacer Principal'}
                                    </button>
                                )}

                                <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onEdit(account)}
                                        className="text-muted-foreground hover:text-primary transition-colors p-2"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(account.id)}
                                        className="text-muted-foreground hover:text-red-500 transition-colors p-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {isCreditCard && account.cutoff_day && account.payment_day && (
                                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Corte: {account.cutoff_day}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Pago: {account.payment_day}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function PayButton({ accountId }: { accountId: string }) {
    const [isPaying, setIsPaying] = useState(false)
    const [amount, setAmount] = useState('')

    async function handlePay() {
        if (!amount) return
        const formData = new FormData()
        formData.append('account_id', accountId)
        formData.append('amount', amount)
        await payAccount(formData)
        setIsPaying(false)
        setAmount('')
    }

    if (isPaying) {
        return (
            <div className="flex flex-1 items-center gap-2 mr-2">
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Monto"
                    className="w-full px-2 py-1 bg-input border border-border rounded text-sm h-9 focus:outline-none focus:ring-2 focus:ring-[#38b6ff]/50"
                    autoFocus
                />
                <button onClick={handlePay} className="bg-primary text-primary-foreground px-3 h-9 rounded text-sm hover:bg-[#f1d77a] hover:text-zinc-900 transition-colors font-bold">Pagar</button>
                <button onClick={() => setIsPaying(false)} className="text-muted-foreground px-2 text-sm hover:text-foreground">x</button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setIsPaying(true)}
            className="flex-1 mr-4 bg-white/5 hover:bg-white/10 text-sm font-medium py-2 rounded-lg transition-colors border border-white/10"
        >
            Realizar Pago
        </button>
    )
}

// Legacy export for backwards compatibility
export { AccountList as CardList }
