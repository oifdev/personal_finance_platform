'use server'

// =============================================
// LEGACY CARDS ACTIONS
// =============================================
// Este archivo existe para compatibilidad hacia atrás.
// Todas las funciones ahora delegan a accounts/actions.ts
// =============================================

export {
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    payCreditCard,
    getCreditCards,
    getCardIssuers,
} from '@/app/dashboard/accounts/actions'
