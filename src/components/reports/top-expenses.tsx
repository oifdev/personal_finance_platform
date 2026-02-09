'use client'

import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrendingDown, Receipt } from 'lucide-react'

interface TopExpense {
    id: string
    description: string
    amount: number
    date: string
    category: string
    categoryColor: string
}

interface TopExpensesProps {
    expenses: TopExpense[]
    maxAmount: number
}

export function TopExpenses({ expenses, maxAmount }: TopExpensesProps) {
    if (expenses.length === 0) {
        return (
            <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                        <TrendingDown className="h-5 w-5 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-semibold">Top 5 Gastos</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No hay gastos en este período</p>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-rose-500/10">
                    <TrendingDown className="h-5 w-5 text-rose-500" />
                </div>
                <h3 className="text-lg font-semibold">Top 5 Gastos</h3>
            </div>

            <div className="space-y-4">
                {expenses.map((expense, index) => {
                    const percentage = maxAmount > 0 ? (expense.amount / maxAmount) * 100 : 0

                    return (
                        <div
                            key={expense.id}
                            className="group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {expense.description || 'Sin descripción'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span
                                                className="inline-block w-2 h-2 rounded-full"
                                                style={{ backgroundColor: expense.categoryColor || '#888' }}
                                            />
                                            <span>{expense.category}</span>
                                            <span>•</span>
                                            <span>{format(new Date(expense.date), "d MMM", { locale: es })}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-rose-400 shrink-0">
                                    -{formatCurrency(expense.amount)}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-linear-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
