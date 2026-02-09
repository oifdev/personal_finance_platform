import { createClient } from '@/utils/supabase/server'
import { ReportsDashboard } from '@/components/reports/reports-dashboard'

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

    if (!transactions) return <div>No se encontraron datos</div>

    return (
        <ReportsDashboard transactions={transactions} />
    )
}
