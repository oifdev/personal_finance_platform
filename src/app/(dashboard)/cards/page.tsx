import { createClient } from '@/utils/supabase/server'
import { CardsManager } from './cards-manager'

export default async function CardsPage() {
    const supabase = await createClient()

    const { data: cards } = await supabase.from('credit_cards').select('*').order('created_at', { ascending: false })

    return (
        <CardsManager cards={cards || []} />
    )
}
