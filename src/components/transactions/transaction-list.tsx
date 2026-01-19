'use client'

import { deleteTransaction } from '@/app/(dashboard)/transactions/actions'
import { Trash2, Pencil, ArrowRightLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getIcon } from '@/lib/icons'
import { useState } from 'react'
import { ConfirmModal } from '@/components/ui/confirm-modal'

export function TransactionList({ transactions, onEdit }: { transactions: any[], onEdit: (tx: any) => void }) {
    const [deleteId, setDeleteId] = useState<string | null>(null)

    if (!transactions.length) {
        return (
            <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No se encontraron transacciones.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && deleteTransaction(deleteId)}
                title="Eliminar Transacción"
                description="¿Estás seguro de que deseas eliminar esta transacción? Si está vinculada a una cuenta, el saldo se revertirá."
                confirmText="Eliminar"
                isDanger
            />

            {transactions.map((tx) => {
                // Get the transaction type code from the relation
                const typeCode = tx.transaction_types?.code || tx.type
                const isExpense = typeCode === 'expense'
                const isIncome = typeCode === 'income'
                const isTransfer = typeCode === 'transfer'
                const isPayment = typeCode === 'payment'

                // Get icon from category or use defaults based on type
                const iconName = tx.categories?.icon || (isTransfer ? 'ArrowRightLeft' : isPayment ? 'CreditCard' : 'HelpCircle')
                const Icon = isTransfer ? ArrowRightLeft : getIcon(iconName)

                // Get account info from the new relation
                const accountName = tx.accounts?.name
                const destinationName = tx.destination_account?.name

                return (
                    <div key={tx.id} className="glass p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-white shrink-0`}
                                style={{
                                    backgroundColor: tx.categories?.color || (isTransfer ? '#38b6ff' : isPayment ? '#f1d77a' : '#555')
                                }}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium truncate max-w-[150px] sm:max-w-xs">
                                    {tx.description || tx.categories?.name || tx.transaction_types?.name}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                    {new Date(tx.date).toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    {accountName && (
                                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/70">
                                            {accountName}
                                        </span>
                                    )}
                                    {isTransfer && destinationName && (
                                        <>
                                            <span className="text-[10px]">→</span>
                                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/70">
                                                {destinationName}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`font-bold tabular-nums ${isExpense ? 'text-rose-500' :
                                    isIncome ? 'text-emerald-500' :
                                        isTransfer ? 'text-blue-400' :
                                            'text-amber-500'
                                }`}>
                                {isExpense ? '-' : isIncome ? '+' : ''}{formatCurrency(Number(tx.amount))}
                            </span>
                            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(tx)}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteId(tx.id)}
                                    className="text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
