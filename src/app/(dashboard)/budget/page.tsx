import { createClient } from '@/utils/supabase/server'
import { deleteBudget } from './actions'
import { Wallet, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { BudgetForm } from '@/components/budget/budget-form'

export default async function BudgetPage() {
    const supabase = await createClient()

    // Fetch Categories
    const { data: categories } = await supabase.from('categories').select('*').eq('type', 'expense').order('name')

    // Fetch Budgets
    const { data: budgets } = await supabase.from('budgets').select('*, categories(name)').order('amount', { ascending: false })

    // Fetch Current Month Expenses to calculate progress
    const startOfMonth = new Date(); startOfMonth.setDate(1);
    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('type', 'expense')
        .gte('date', startOfMonth.toISOString())

    // Calculate spent per category
    const spentMap = new Map() // category_id -> amount
    let totalSpent = 0

    transactions?.forEach(tx => {
        totalSpent += Number(tx.amount)
        if (tx.category_id) {
            spentMap.set(tx.category_id, (spentMap.get(tx.category_id) || 0) + Number(tx.amount))
        }
    })

    // Merge Budgets with Spent
    const budgetData = budgets?.map(b => {
        const spent = b.category_id ? (spentMap.get(b.category_id) || 0) : totalSpent
        const progress = Math.min((spent / b.amount) * 100, 100)
        return {
            ...b,
            spent,
            progress
        }
    })

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Presupuestos</h2>
                <p className="text-muted-foreground mt-1">Establece límites mensuales para ahorrar dinero.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Set Budget Form Component */}
                <div className="lg:col-span-1">
                    <BudgetForm categories={categories || []} />
                </div>

                {/* Budget List */}
                <div className="lg:col-span-2 space-y-4">
                    {budgetData?.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground glass-card rounded-xl border-dashed border">
                            No hay presupuestos configurados.
                        </div>
                    )}

                    {budgetData?.map(budget => (
                        <div key={budget.id} className="glass p-6 rounded-xl space-y-3 relative overflow-hidden">
                            <div className="flex justify-between items-center z-10 relative">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{budget.category_id ? budget.categories.name : 'Presupuesto Global'}</h4>
                                        <p className="text-sm text-muted-foreground">Límite Mensual</p>
                                    </div>
                                </div>
                                {/* Use a form button which is valid for server actions */}
                                <form action={async () => {
                                    'use server';
                                    await deleteBudget(budget.id)
                                }}>
                                    <button className="text-muted-foreground hover:text-red-500 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>

                            <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{formatCurrency(budget.spent)} gastado</span>
                                    <span className="text-muted-foreground">de {formatCurrency(budget.amount)}</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${budget.progress >= 100 ? 'bg-red-500' : budget.progress > 80 ? 'bg-amber-500' : 'bg-primary'}`}
                                        style={{ width: `${budget.progress}%` }}
                                    />
                                </div>
                            </div>

                            {budget.progress >= 100 && (
                                <p className="text-xs text-red-500 mt-2 font-bold relative z-10">¡Presupuesto excedido!</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
