import { createClient } from '@/utils/supabase/server'
import { CardList } from '@/components/cards/card-list'
import { CardForm } from '@/components/cards/card-form'

export default async function CardsPage() {
    const supabase = await createClient()

    const { data: cards } = await supabase.from('credit_cards').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tarjetas de Crédito</h2>
                    <p className="text-muted-foreground mt-1">Gestiona tus tarjetas y deudas.</p>
                </div>
                <CardForm />
            </div>

            {!cards?.length ? (
                <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
                    No has agregado ninguna tarjeta de crédito aún.
                </div>
            ) : (
                <CardList cards={cards} />
            )}
        </div>
    )
}
