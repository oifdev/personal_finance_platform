import { createClient } from '@/utils/supabase/server'
import { FinancialCharts } from '@/components/reports/financial-charts'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Fetch all transactions with relations
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
            *,
            categories (name, color),
            transaction_types (code, name)
        `)
        .order('date', { ascending: true })

    if (!transactions) return <div>No data found</div>

    // Process Data for Charts
    // 1. Monthly Data
    const monthlyMap = new Map()

    transactions.forEach((tx: any) => {
        const date = new Date(tx.date)
        const monthKey = date.toLocaleString('default', { month: 'short' })
        const typeCode = tx.transaction_types?.code

        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { name: monthKey, income: 0, expense: 0 })
        }

        const entry = monthlyMap.get(monthKey)
        if (typeCode === 'income') {
            entry.income += Number(tx.amount)
        } else if (typeCode === 'expense') {
            entry.expense += Number(tx.amount)
        }
    })

    const monthlyData = Array.from(monthlyMap.values())

    // 2. Category Data (Expenses only)
    const categoryMap = new Map()
    transactions.filter((t: any) => t.transaction_types?.code === 'expense').forEach((tx: any) => {
        const catName = tx.categories?.name || 'Sin Categoría'
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
                <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
                <p className="text-muted-foreground mt-1">Visualiza tu salud financiera</p>
            </div>

            <FinancialCharts
                monthlyData={monthlyData}
                categoryData={categoryData}
                transactions={transactions}
            />
        </div>
    )
}
