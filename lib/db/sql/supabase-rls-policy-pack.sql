begin;

-- 1) Enable RLS on all current app tables in public schema.
alter table if exists public.products enable row level security;
alter table if exists public.reviews enable row level security;
alter table if exists public.cart_items enable row level security;
alter table if exists public.users enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;

-- 2) Deny direct anon/authenticated access by default for all public tables.
-- Backend using service_role is typically unaffected.
revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- 3) Allow read-only public data (catalog + reviews).
grant select on table public.products to anon, authenticated;
grant select on table public.reviews to anon, authenticated;

-- 4) RLS policies for allowed public reads.
drop policy if exists public_read_products on public.products;
create policy public_read_products
  on public.products
  for select
  to anon, authenticated
  using (true);

drop policy if exists public_read_reviews on public.reviews;
create policy public_read_reviews
  on public.reviews
  for select
  to anon, authenticated
  using (true);

-- No policies are created for users/orders/order_items/cart_items,
-- so anon/authenticated cannot read or write those rows via PostgREST.

commit;
