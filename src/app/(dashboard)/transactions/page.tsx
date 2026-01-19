import { createClient } from '@/utils/supabase/server'
import { TransactionsManager } from './transactions-manager'

export default async function TransactionsPage() {
    const supabase = await createClient()

    // Fetch Categories with type relation
    const { data: categories } = await supabase
        .from('categories')
        .select('*, category_types(code, name)')
        .eq('is_active', true)
        .order('name')

    // Fetch Accounts (replaces credit_cards)
    const { data: accounts } = await supabase
        .from('accounts')
        .select('*, account_types(code, name), currencies(symbol)')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name')

    // Fetch Transactions with new relations
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
            *,
            transaction_types (code, name),
            categories (name, icon, color, category_types(code)),
            accounts:account_id (name, account_types(code), currencies(symbol)),
            destination_account:destination_account_id (name)
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
                accounts={accounts || []}
            />
        </div>
    )
}
