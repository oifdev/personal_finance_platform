import { createClient } from '@/utils/supabase/server'
import { FinancialCharts } from '@/components/reports/financial-charts'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Fetch all transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .order('date', { ascending: true })

    if (!transactions) return <div>No data found</div>

    // Process Data for Charts
    // 1. Monthly Data
    const monthlyMap = new Map()

    transactions.forEach(tx => {
        const date = new Date(tx.date)
        const monthKey = date.toLocaleString('default', { month: 'short' })

        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { name: monthKey, income: 0, expense: 0 })
        }

        const entry = monthlyMap.get(monthKey)
        if (tx.type === 'income') {
            entry.income += Number(tx.amount)
        } else if (tx.type === 'expense') {
            entry.expense += Number(tx.amount)
        }
    })

    // Convert Map to Array and sort? (Assuming data came sorted by date, months might be in order if year is same. 
    // Ideally need year support but simplifying for now)
    const monthlyData = Array.from(monthlyMap.values())

    // 2. Category Data (Expenses only)
    const categoryMap = new Map()
    transactions.filter(t => t.type === 'expense').forEach(tx => {
        const catName = tx.categories?.name || 'Uncategorized'
        const color = tx.categories?.color || '#888'

        if (!categoryMap.has(catName)) {
            categoryMap.set(catName, { name: catName, value: 0, color })
        }
        categoryMap.get(catName).value += Number(tx.amount)
    })

    const categoryData = Array.from(categoryMap.values())

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                <p className="text-muted-foreground mt-1">Visualize your financial health.</p>
            </div>

            <FinancialCharts
                monthlyData={monthlyData}
                categoryData={categoryData}
                transactions={transactions}
            />
        </div>
    )
}
