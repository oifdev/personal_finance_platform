'use client'

import { useState } from 'react'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { TransactionList } from '@/components/transactions/transaction-list'

interface TransactionsManagerProps {
    transactions: any[]
    categories: any[]
    creditCards: any[]
}

export function TransactionsManager({ transactions, categories, creditCards }: TransactionsManagerProps) {
    const [editingTransaction, setEditingTransaction] = useState<any | null>(null)

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <TransactionForm
                    categories={categories}
                    creditCards={creditCards}
                    initialData={editingTransaction}
                    onCancel={() => setEditingTransaction(null)}
                    key={editingTransaction?.id || 'new'}
                />
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold">History</h3>
                <TransactionList
                    transactions={transactions}
                    onEdit={setEditingTransaction}
                />
            </div>
        </div>
    )
}
