'use client'

import * as Icons from 'lucide-react'
import { deleteTransaction } from '@/app/(dashboard)/transactions/actions'
import { Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

import { getIcon } from '@/lib/icons'

export function TransactionList({ transactions }: { transactions: any[] }) {
    if (!transactions.length) {
        return (
            <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No se encontraron transacciones.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {transactions.map((tx) => {
                const Icon = getIcon(tx.categories?.icon || 'HelpCircle')
                const isExpense = tx.type === 'expense'

                return (
                    <div key={tx.id} className="glass p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-white shrink-0`}
                                style={{ backgroundColor: tx.categories?.color || '#555' }}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium truncate max-w-[150px] sm:max-w-xs">{tx.description || tx.categories?.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    {new Date(tx.date).toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    {tx.credit_cards && (
                                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/70">
                                            {tx.credit_cards.name}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`font-bold tabular-nums ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {isExpense ? '-' : '+'}{formatCurrency(Number(tx.amount))}
                            </span>
                            <button
                                onClick={() => deleteTransaction(tx.id)}
                                className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
