-- =============================================
-- MIGRATION: V1 to V2 (Normalized Schema)
-- =============================================
-- INSTRUCCIONES:
-- 1. ANTES de ejecutar este script, haz un BACKUP de tus datos.
-- 2. Este script ELIMINA las tablas antiguas y crea las nuevas.
-- 3. Ejecuta en tu Dashboard de Supabase -> SQL Editor.
-- =============================================

-- =============================================
-- STEP 1: DROP OLD TRIGGERS AND FUNCTIONS
-- =============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- =============================================
-- STEP 2: DROP OLD POLICIES
-- =============================================

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- Categories
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

-- Credit Cards
DROP POLICY IF EXISTS "Users can view own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can insert own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can update own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can delete own credit cards" ON public.credit_cards;

-- Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

-- Budgets
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

-- AI Insights (if exists)
DROP POLICY IF EXISTS "Users can view own ai_insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can insert own ai_insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can update own ai_insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can delete own ai_insights" ON public.ai_insights;

-- =============================================
-- STEP 3: DROP OLD TABLES (Order matters due to FK)
-- =============================================

DROP TABLE IF EXISTS public.ai_insights CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.credit_cards CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =============================================
-- STEP 4: CREATE NEW MASTER TABLES
-- =============================================

-- Tipos de Categoría
CREATE TABLE public.category_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Tipos de Transacción
CREATE TABLE public.transaction_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    affects_balance text CHECK (affects_balance IN ('increase', 'decrease', 'neutral')) DEFAULT 'neutral',
    created_at timestamptz DEFAULT now()
);

-- Tipos de Cuenta
CREATE TABLE public.account_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    allows_credit boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Emisores de Tarjetas
CREATE TABLE public.card_issuers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    logo_url text,
    created_at timestamptz DEFAULT now()
);

-- Monedas
CREATE TABLE public.currencies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    symbol text NOT NULL,
    decimal_places integer DEFAULT 2,
    created_at timestamptz DEFAULT now()
);

-- =============================================
-- STEP 5: SEED MASTER DATA
-- =============================================

INSERT INTO public.category_types (code, name, description) VALUES
('income', 'Ingreso', 'Categorías para ingresos de dinero'),
('expense', 'Gasto', 'Categorías para gastos de dinero');

INSERT INTO public.transaction_types (code, name, description, affects_balance) VALUES
('income', 'Ingreso', 'Entrada de dinero', 'increase'),
('expense', 'Gasto', 'Salida de dinero', 'decrease'),
('transfer', 'Transferencia', 'Movimiento entre cuentas', 'neutral'),
('payment', 'Pago de Tarjeta', 'Pago a tarjeta de crédito', 'neutral');

INSERT INTO public.account_types (code, name, description, allows_credit) VALUES
('cash', 'Efectivo', 'Dinero en efectivo', false),
('bank', 'Cuenta Bancaria', 'Cuenta de banco (débito)', false),
('credit_card', 'Tarjeta de Crédito', 'Tarjeta de crédito', true),
('savings', 'Ahorro', 'Cuenta de ahorros', false),
('investment', 'Inversión', 'Cuenta de inversiones', false);

INSERT INTO public.card_issuers (code, name) VALUES
('visa', 'Visa'),
('mastercard', 'Mastercard'),
('amex', 'American Express'),
('discover', 'Discover'),
('other', 'Otro');

INSERT INTO public.currencies (code, name, symbol, decimal_places) VALUES
('HNL', 'Lempira Hondureño', 'L', 2),
('USD', 'Dólar Estadounidense', '$', 2),
('EUR', 'Euro', '€', 2),
('MXN', 'Peso Mexicano', '$', 2),
('GTQ', 'Quetzal Guatemalteco', 'Q', 2);

-- =============================================
-- STEP 6: CREATE NEW MAIN TABLES
-- =============================================

-- Profiles
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text,
    full_name text,
    avatar_url text,
    default_currency_id uuid REFERENCES public.currencies(id),
    timezone text DEFAULT 'America/Tegucigalpa',
    language text DEFAULT 'es',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
    -- Nota: Se removió el constraint username_length para permitir signups sin nombre
);

-- Categories
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type_id uuid REFERENCES public.category_types(id) NOT NULL,
    parent_category_id uuid REFERENCES public.categories(id),
    name text NOT NULL,
    icon text,
    color text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Accounts
CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    account_type_id uuid REFERENCES public.account_types(id) NOT NULL,
    currency_id uuid REFERENCES public.currencies(id) NOT NULL,
    name text NOT NULL,
    current_balance numeric(12, 2) DEFAULT 0,
    initial_balance numeric(12, 2) DEFAULT 0,
    card_issuer_id uuid REFERENCES public.card_issuers(id),
    last_4_digits text,
    credit_limit numeric(12, 2),
    cutoff_day integer CHECK (cutoff_day >= 1 AND cutoff_day <= 31),
    payment_day integer CHECK (payment_day >= 1 AND payment_day <= 31),
    color text,
    icon text,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_type_id uuid REFERENCES public.transaction_types(id) NOT NULL,
    category_id uuid REFERENCES public.categories(id),
    account_id uuid REFERENCES public.accounts(id),
    amount numeric(12, 2) NOT NULL CHECK (amount > 0),
    description text,
    date date NOT NULL DEFAULT CURRENT_DATE,
    destination_account_id uuid REFERENCES public.accounts(id),
    is_recurring boolean DEFAULT false,
    recurrence_rule jsonb,
    parent_transaction_id uuid REFERENCES public.transactions(id),
    tags text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Budgets
CREATE TABLE public.budgets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES public.categories(id),
    currency_id uuid REFERENCES public.currencies(id),
    name text,
    amount numeric(12, 2) NOT NULL CHECK (amount > 0),
    period_type text CHECK (period_type IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom')) DEFAULT 'monthly',
    start_date date,
    end_date date,
    alert_threshold numeric(5, 2) DEFAULT 80.00,
    send_alerts boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- AI Insights
CREATE TABLE public.ai_insights (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text,
    insight_type text CHECK (insight_type IN ('budget_analysis', 'saving_tip', 'spending_alert', 'trend_analysis', 'recommendation')) DEFAULT 'recommendation',
    content text NOT NULL,
    context jsonb,
    related_entities jsonb,
    severity text CHECK (severity IN ('info', 'warning', 'critical', 'success')) DEFAULT 'info',
    is_actionable boolean DEFAULT false,
    is_read boolean DEFAULT false,
    is_dismissed boolean DEFAULT false,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- =============================================
-- STEP 7: CREATE INDEXES
-- =============================================

CREATE INDEX idx_categories_user_type ON public.categories(user_id, type_id);
CREATE INDEX idx_accounts_user ON public.accounts(user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, transaction_type_id);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_account ON public.transactions(user_id, account_id);
CREATE INDEX idx_budgets_user_category ON public.budgets(user_id, category_id);
CREATE INDEX idx_ai_insights_user ON public.ai_insights(user_id, created_at DESC);
CREATE INDEX idx_transactions_tags ON public.transactions USING GIN (tags);

-- =============================================
-- STEP 8: ENABLE RLS
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 9: CREATE POLICIES
-- =============================================

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Accounts
CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- AI Insights
CREATE POLICY "Users can view own ai_insights" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_insights" ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_insights" ON public.ai_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai_insights" ON public.ai_insights FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- STEP 10: CREATE TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 11: CREATE HANDLE_NEW_USER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_currency uuid;
    income_type_id uuid;
    expense_type_id uuid;
    cash_type_id uuid;
BEGIN
    -- Obtener IDs de tablas maestras (con manejo de NULL)
    SELECT id INTO default_currency FROM public.currencies WHERE code = 'HNL' LIMIT 1;
    SELECT id INTO income_type_id FROM public.category_types WHERE code = 'income' LIMIT 1;
    SELECT id INTO expense_type_id FROM public.category_types WHERE code = 'expense' LIMIT 1;
    SELECT id INTO cash_type_id FROM public.account_types WHERE code = 'cash' LIMIT 1;

    -- Crear perfil (sin constraint de longitud si full_name es NULL o corto)
    INSERT INTO public.profiles (id, email, full_name, avatar_url, default_currency_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Usuario Nuevo'),
        NEW.raw_user_meta_data->>'avatar_url',
        default_currency
    );

    -- Solo crear categorías si tenemos los tipos
    IF income_type_id IS NOT NULL THEN
        INSERT INTO public.categories (user_id, type_id, name, icon, color) VALUES
        (NEW.id, income_type_id, 'Salario', 'wallet', '#10B981'),
        (NEW.id, income_type_id, 'Freelance', 'briefcase', '#34D399'),
        (NEW.id, income_type_id, 'Inversiones', 'trending-up', '#22D3EE'),
        (NEW.id, income_type_id, 'Otros Ingresos', 'plus-circle', '#A3E635');
    END IF;

    IF expense_type_id IS NOT NULL THEN
        INSERT INTO public.categories (user_id, type_id, name, icon, color) VALUES
        (NEW.id, expense_type_id, 'Supermercado', 'shopping-cart', '#F87171'),
        (NEW.id, expense_type_id, 'Gasolina', 'fuel', '#FBBF24'),
        (NEW.id, expense_type_id, 'Educación', 'graduation-cap', '#60A5FA'),
        (NEW.id, expense_type_id, 'Entretenimiento', 'film', '#A78BFA'),
        (NEW.id, expense_type_id, 'Salud', 'heart', '#EC4899'),
        (NEW.id, expense_type_id, 'Restaurantes', 'utensils', '#FB923C'),
        (NEW.id, expense_type_id, 'Transporte', 'car', '#94A3B8'),
        (NEW.id, expense_type_id, 'Servicios', 'home', '#6366F1'),
        (NEW.id, expense_type_id, 'Otros Gastos', 'more-horizontal', '#78716C');
    END IF;

    -- Solo crear cuenta de efectivo si tenemos el tipo y la moneda
    IF cash_type_id IS NOT NULL AND default_currency IS NOT NULL THEN
        INSERT INTO public.accounts (user_id, account_type_id, currency_id, name, icon, color, is_default)
        VALUES (NEW.id, cash_type_id, default_currency, 'Efectivo', 'banknote', '#10B981', true);
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar el signup
        RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- MIGRATION COMPLETE!
-- =============================================
-- Ahora puedes:
-- 1. Crear un nuevo usuario para probar el trigger
-- 2. O crear manualmente los datos del usuario existente
-- =============================================
