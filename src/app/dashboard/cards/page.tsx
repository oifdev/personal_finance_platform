import { createClient } from '@/utils/supabase/server'
import { AccountsManager } from './accounts-manager'

export default async function AccountsPage() {
    const supabase = await createClient()

    // Fetch all accounts with their relations
    const { data: accounts } = await supabase
        .from('accounts')
        .select('*, account_types(code, name, allows_credit), currencies(code, symbol), card_issuers(name)')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

    // Fetch master data for the form
    const { data: accountTypes } = await supabase
        .from('account_types')
        .select('*')
        .order('code')

    const { data: cardIssuers } = await supabase
        .from('card_issuers')
        .select('*')
        .order('name')

    const { data: currencies } = await supabase
        .from('currencies')
        .select('*')
        .order('code')

    return (
        <AccountsManager
            accounts={accounts || []}
            accountTypes={accountTypes || []}
            cardIssuers={cardIssuers || []}
            currencies={currencies || []}
        />
    )
}
