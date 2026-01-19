'use client'

import { useState } from 'react'
import { AccountForm } from '@/components/cards/card-form'
import { AccountList } from '@/components/cards/card-list'
import type { Account, AccountType, CardIssuer, Currency } from '@/types/database'

interface AccountsManagerProps {
    accounts: any[]
    accountTypes: any[]
    cardIssuers: any[]
    currencies: any[]
}

export function AccountsManager({ accounts, accountTypes, cardIssuers, currencies }: AccountsManagerProps) {
    const [editingAccount, setEditingAccount] = useState<any | null>(null)

    // Separate accounts by type for organized display
    const creditCards = accounts.filter(a => a.account_types?.code === 'credit_card')
    const bankAccounts = accounts.filter(a => a.account_types?.code === 'bank')
    const cashAccounts = accounts.filter(a => a.account_types?.code === 'cash')
    const otherAccounts = accounts.filter(a =>
        !['credit_card', 'bank', 'cash'].includes(a.account_types?.code)
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cuentas y Tarjetas</h2>
                    <p className="text-muted-foreground mt-1">Gestiona tus cuentas, tarjetas y métodos de pago.</p>
                </div>
                <AccountForm
                    initialData={editingAccount}
                    accountTypes={accountTypes}
                    cardIssuers={cardIssuers}
                    currencies={currencies}
                    onCancel={() => setEditingAccount(null)}
                    key={editingAccount?.id || 'new'}
                />
            </div>

            {!accounts?.length ? (
                <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
                    No has agregado ninguna cuenta aún.
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Credit Cards Section */}
                    {creditCards.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-muted-foreground">Tarjetas de Crédito</h3>
                            <AccountList
                                accounts={creditCards}
                                onEdit={setEditingAccount}
                            />
                        </div>
                    )}

                    {/* Bank Accounts Section */}
                    {bankAccounts.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-muted-foreground">Cuentas Bancarias</h3>
                            <AccountList
                                accounts={bankAccounts}
                                onEdit={setEditingAccount}
                            />
                        </div>
                    )}

                    {/* Cash Section */}
                    {cashAccounts.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-muted-foreground">Efectivo</h3>
                            <AccountList
                                accounts={cashAccounts}
                                onEdit={setEditingAccount}
                            />
                        </div>
                    )}

                    {/* Other Accounts */}
                    {otherAccounts.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-muted-foreground">Otras Cuentas</h3>
                            <AccountList
                                accounts={otherAccounts}
                                onEdit={setEditingAccount}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Legacy export for backwards compatibility
export { AccountsManager as CardsManager }
