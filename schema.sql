-- Create tables for Personal Finance App

-- Create profiles table to extend auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  currency text default 'USD',
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Categories for Incomes and Expenses
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  icon text, -- Icon name from Lucide (e.g., 'fuel', 'graduation-cap')
  color text, -- Hex code or tailwind class
  created_at timestamp with time zone default now()
);

-- Credit Cards Management
create table public.credit_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null, -- e.g., "Visa Gold", "Amex"
  last_4_digits text,
  credit_limit numeric(12, 2) not null default 0,
  current_balance numeric(12, 2) not null default 0,
  cutoff_day integer, -- Day of month (1-31)
  payment_day integer, -- Day of month (1-31)
  color text,
  created_at timestamp with time zone default now()
);

-- Transactions (Incomes, Expenses, Payments)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  amount numeric(12, 2) not null,
  type text check (type in ('income', 'expense', 'payment', 'transfer')) not null,
  description text,
  date date not null default CURRENT_DATE,
  
  -- Foreign Keys
  category_id uuid references public.categories(id),
  credit_card_id uuid references public.credit_cards(id), -- If paid with credit card or payment TO credit card
  
  is_recurring boolean default false,
  created_at timestamp with time zone default now()
);

-- Budgets
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  category_id uuid references public.categories(id), -- If null, global budget
  amount numeric(12, 2) not null,
  period text check (period in ('weekly', 'monthly', 'yearly')) default 'monthly',
  start_date date,
  end_date date,
  created_at timestamp with time zone default now()
);

-- RLS Policies (Row Level Security)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.credit_cards enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using ( true );
create policy "Users can insert their own profile." on public.profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on public.profiles for update using ( auth.uid() = id );

create policy "Users can view own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id);

create policy "Users can view own credit cards" on public.credit_cards for select using (auth.uid() = user_id);
create policy "Users can insert own credit cards" on public.credit_cards for insert with check (auth.uid() = user_id);
create policy "Users can update own credit cards" on public.credit_cards for update using (auth.uid() = user_id);
create policy "Users can delete own credit cards" on public.credit_cards for delete using (auth.uid() = user_id);

create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

create policy "Users can view own budgets" on public.budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on public.budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on public.budgets for delete using (auth.uid() = user_id);

-- Trigger to handle new user profile creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Insert default categories
  insert into public.categories (user_id, name, type, icon, color) values
  (new.id, 'Salary', 'income', 'wallet', '#10B981'),
  (new.id, 'Freelance', 'income', 'briefcase', '#34D399'),
  (new.id, 'Supermarket', 'expense', 'shopping-cart', '#F87171'), -- "supermercado"
  (new.id, 'Gas', 'expense', 'fuel', '#FBBF24'), -- "gasolina"
  (new.id, 'Education', 'expense', 'graduation-cap', '#60A5FA'), -- "educacion"
  (new.id, 'Entertainment', 'expense', 'film', '#A78BFA'),
  (new.id, 'Health', 'expense', 'heart', '#EC4899');
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
