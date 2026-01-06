import { createClient } from '@/utils/supabase/server'
import { TransactionsManager } from './transactions-manager'

export default async function TransactionsPage() {
    const supabase = await createClient()

    // Fetch Categories
    const { data: categories } = await supabase.from('categories').select('*').order('name')

    // Fetch Credit Cards
    const { data: cards } = await supabase.from('credit_cards').select('*').order('name')

    // Fetch Transactions with relations
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
        *,
        categories (name, icon, color),
        credit_cards (name)
    `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Transacciones</h2>
                <p className="text-muted-foreground mt-1">Gestiona tus ingresos y gastos.</p>
            </div>

            <TransactionsManager
                transactions={transactions || []}
                categories={categories || []}
                creditCards={cards || []}
            />
        </div>
    )
}
