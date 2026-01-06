import { createClient } from '@/utils/supabase/server'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { TransactionList } from '@/components/transactions/transaction-list'

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

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <TransactionForm
                        categories={categories || []}
                        creditCards={cards || []}
                    />
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold">History</h3>
                    <TransactionList transactions={transactions || []} />
                </div>
            </div>
        </div>
    )
}
