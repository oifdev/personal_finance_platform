// =============================================
// Database Types for Personal Finance App v2.0
// =============================================
// Tipos TypeScript que reflejan el esquema normalizado
// de la base de datos en Supabase.
// =============================================

// =============================================
// TABLAS MAESTRAS (Lookup Tables)
// =============================================

export interface CategoryType {
    id: string;
    code: 'income' | 'expense';
    name: string;
    description?: string;
    created_at: string;
}

export interface TransactionType {
    id: string;
    code: 'income' | 'expense' | 'transfer' | 'payment';
    name: string;
    description?: string;
    affects_balance: 'increase' | 'decrease' | 'neutral';
    created_at: string;
}

export interface AccountType {
    id: string;
    code: 'cash' | 'bank' | 'credit_card' | 'savings' | 'investment';
    name: string;
    description?: string;
    allows_credit: boolean;
    created_at: string;
}

export interface CardIssuer {
    id: string;
    code: string;
    name: string;
    logo_url?: string;
    created_at: string;
}

export interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    created_at: string;
}

// =============================================
// PERFIL DE USUARIO
// =============================================

export interface Profile {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    default_currency_id?: string;
    timezone: string;
    language: string;
    created_at: string;
    updated_at: string;

    // Relaciones (cuando se hace join)
    default_currency?: Currency;
}

// =============================================
// CATEGORÍAS
// =============================================

export interface Category {
    id: string;
    user_id: string;
    type_id: string;
    parent_category_id?: string;
    name: string;
    icon?: string;
    color?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;

    // Relaciones (cuando se hace join)
    type?: CategoryType;
    parent_category?: Category;
    subcategories?: Category[];
}

// Para formularios
export interface CategoryFormData {
    name: string;
    type_id: string; // ID del CategoryType
    parent_category_id?: string;
    icon?: string;
    color?: string;
}

// =============================================
// CUENTAS (Reemplaza credit_cards)
// =============================================

export interface Account {
    id: string;
    user_id: string;
    account_type_id: string;
    currency_id: string;
    name: string;
    current_balance: number;
    initial_balance: number;

    // Campos específicos para tarjetas de crédito
    card_issuer_id?: string;
    last_4_digits?: string;
    credit_limit?: number;
    cutoff_day?: number;
    payment_day?: number;

    // UI/UX
    color?: string;
    icon?: string;
    is_active: boolean;
    is_default: boolean;

    notes?: string;
    created_at: string;
    updated_at: string;

    // Relaciones (cuando se hace join)
    account_type?: AccountType;
    currency?: Currency;
    card_issuer?: CardIssuer;
}

// Para formularios
export interface AccountFormData {
    name: string;
    account_type_id: string;
    currency_id: string;
    initial_balance?: number;

    // Para tarjetas de crédito
    card_issuer_id?: string;
    last_4_digits?: string;
    credit_limit?: number;
    cutoff_day?: number;
    payment_day?: number;

    color?: string;
    icon?: string;
    notes?: string;
}

// =============================================
// TRANSACCIONES
// =============================================

export interface Transaction {
    id: string;
    user_id: string;
    transaction_type_id: string;
    category_id?: string;
    account_id?: string;

    amount: number;
    description?: string;
    date: string; // ISO date string

    destination_account_id?: string;

    is_recurring: boolean;
    recurrence_rule?: RecurrenceRule;
    parent_transaction_id?: string;

    tags?: string[];

    created_at: string;
    updated_at: string;

    // Relaciones (cuando se hace join)
    transaction_type?: TransactionType;
    category?: Category;
    account?: Account;
    destination_account?: Account;
}

export interface RecurrenceRule {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    interval: number;
    end_date?: string;
}

// Para formularios
export interface TransactionFormData {
    transaction_type_id: string; // o 'income' | 'expense' | 'transfer' | 'payment'
    amount: number;
    description?: string;
    date: string;
    category_id?: string;
    account_id?: string;
    destination_account_id?: string; // Para transferencias
    tags?: string[];
    is_recurring?: boolean;
    recurrence_rule?: RecurrenceRule;
}

// =============================================
// PRESUPUESTOS
// =============================================

export interface Budget {
    id: string;
    user_id: string;
    category_id?: string;
    currency_id?: string;

    name?: string;
    amount: number;

    period_type: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    start_date?: string;
    end_date?: string;

    alert_threshold: number;
    send_alerts: boolean;

    is_active: boolean;

    created_at: string;
    updated_at: string;

    // Relaciones (cuando se hace join)
    category?: Category;
    currency?: Currency;

    // Campos calculados (para la UI)
    spent?: number;
    remaining?: number;
    percentage?: number;
}

// Para formularios
export interface BudgetFormData {
    category_id?: string;
    currency_id?: string;
    name?: string;
    amount: number;
    period_type?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    start_date?: string;
    end_date?: string;
    alert_threshold?: number;
}

// =============================================
// AI INSIGHTS
// =============================================

export type InsightType = 'budget_analysis' | 'saving_tip' | 'spending_alert' | 'trend_analysis' | 'recommendation';
export type InsightSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface AIInsight {
    id: string;
    user_id: string;

    title?: string;
    insight_type: InsightType;
    content: string;

    context?: {
        category_id?: string;
        budget_id?: string;
        period?: string;
        [key: string]: unknown;
    };
    related_entities?: Array<{
        type: 'category' | 'budget' | 'account' | 'transaction';
        id: string;
    }>;

    severity: InsightSeverity;
    is_actionable: boolean;
    is_read: boolean;
    is_dismissed: boolean;

    expires_at?: string;
    created_at: string;
}

// =============================================
// TIPOS AUXILIARES PARA LA UI
// =============================================

// Tipo unificado para selectores
export interface SelectOption {
    value: string;
    label: string;
    icon?: string;
    color?: string;
}

// Respuestas de API paginadas
export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Estado de formulario genérico
export interface FormState {
    message: string;
    success: boolean;
    errors?: Record<string, string[]>;
}

// =============================================
// TIPOS LEGACY (Para compatibilidad temporal)
// =============================================

/** @deprecated Use Account instead */
export interface CreditCard extends Account { }

/** @deprecated Use Category with type join instead */
export interface LegacyCategory {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    created_at: string;
}

/** @deprecated Use Transaction with type join instead */
export interface LegacyTransaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'income' | 'expense' | 'payment' | 'transfer';
    description?: string;
    date: string;
    category_id?: string;
    credit_card_id?: string;
    is_recurring: boolean;
    created_at: string;
}
