import { createClient } from '@/utils/supabase/server'
import { BudgetsManager } from './budgets-manager'

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

            <BudgetsManager
                budgets={budgetData || []}
                categories={categories || []}
            />
        </div>
    )
}
