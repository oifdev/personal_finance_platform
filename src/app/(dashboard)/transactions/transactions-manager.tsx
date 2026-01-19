'use client'

import { useState } from 'react'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { TransactionList } from '@/components/transactions/transaction-list'
import type { Transaction, Category, Account } from '@/types/database'

interface TransactionsManagerProps {
    transactions: any[]
    categories: any[]
    accounts: any[] // Changed from creditCards
}

export function TransactionsManager({ transactions, categories, accounts }: TransactionsManagerProps) {
    const [editingTransaction, setEditingTransaction] = useState<any | null>(null)

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <TransactionForm
                    categories={categories}
                    accounts={accounts}
                    initialData={editingTransaction}
                    onCancel={() => setEditingTransaction(null)}
                    key={editingTransaction?.id || 'new'}
                />
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold">Historial</h3>
                <TransactionList
                    transactions={transactions}
                    onEdit={setEditingTransaction}
                />
            </div>
        </div>
    )
}
