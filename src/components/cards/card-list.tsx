'use client'

import { useState } from 'react'
import { payCreditCard, deleteCreditCard } from '@/app/(dashboard)/cards/actions'
import { CreditCard, Trash2, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function CardList({ cards }: { cards: any[] }) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(card => (
                <div key={card.id} className="glass-card relative overflow-hidden rounded-xl p-6 transition-all hover:shadow-lg">
                    {/* Visual Card Background Effect */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="font-bold text-lg">{card.name}</h3>
                            <p className="text-muted-foreground text-sm">**** **** **** {card.last_4_digits || '****'}</p>
                        </div>
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Saldo Actual</p>
                            <p className="text-2xl font-bold">{formatCurrency(Number(card.current_balance || 0))}</p>
                        </div>

                        <div className="flex justify-between text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs">Límite</p>
                                <p>{formatCurrency(Number(card.credit_limit || 0))}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Disponible</p>
                                <p className="text-emerald-500">{formatCurrency(Number(card.credit_limit || 0) - Number(card.current_balance || 0))}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                            <PayButton cardId={card.id} />

                            <button
                                onClick={() => deleteCreditCard(card.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        {card.cutoff_day && card.payment_day && (
                            <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Corte: {card.cutoff_day}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Pago: {card.payment_day}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function PayButton({ cardId }: { cardId: string }) {
    const [isPaying, setIsPaying] = useState(false)
    const [amount, setAmount] = useState('')

    async function handlePay() {
        if (!amount) return
        const formData = new FormData()
        formData.append('card_id', cardId)
        formData.append('amount', amount)
        await payCreditCard(formData)
        setIsPaying(false);
        setAmount('');
    }

    if (isPaying) {
        return (
            <div className="flex flex-1 items-center gap-2 mr-2">
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Monto"
                    className="w-full px-2 py-1 bg-input border border-border rounded text-sm h-9"
                    autoFocus
                />
                <button onClick={handlePay} className="bg-primary text-primary-foreground px-3 h-9 rounded text-sm hover:bg-emerald-600">Pagar</button>
                <button onClick={() => setIsPaying(false)} className="text-muted-foreground px-2 text-sm hover:text-white">x</button>
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
