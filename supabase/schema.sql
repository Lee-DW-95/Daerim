-- ============================================================================
-- 지웰대림공인중개사 사이트 — Supabase DB 스키마
--
-- 사용법: Supabase Studio → SQL Editor → 이 파일 내용 전체를 붙여넣고 실행
-- 한 번만 실행하면 됩니다. 재실행해도 안전(create if not exists / drop policy 패턴).
-- ============================================================================

-- 1) 매물 테이블 -------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  complex_id text not null,
  deal_kind text not null check (deal_kind in ('trade', 'jeonse', 'monthly')),
  size_pyeong int not null,
  exclusive_area_sqm numeric,
  current_floor int not null,
  total_floor int,
  direction text not null
    check (direction in ('south','southeast','southwest','east','west','north')),
  price_manwon int not null,
  monthly_rent_manwon int,
  available_from text not null,
  status text not null default 'available'
    check (status in ('available','pending','sold')),
  published_at date not null default current_date,
  headline text not null,
  agent_note text not null,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  features text[] not null default '{}',
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- 인덱스
create index if not exists idx_listings_published_at on public.listings (published_at desc);
create index if not exists idx_listings_complex_id   on public.listings (complex_id);
create index if not exists idx_listings_status        on public.listings (status);

-- 2) RLS (Row Level Security) -----------------------------------------------
alter table public.listings enable row level security;

-- 공개 읽기 (사이트 노출용)
drop policy if exists "Public can read listings" on public.listings;
create policy "Public can read listings"
  on public.listings for select
  using (true);

-- 인증된 사용자(=어드민)만 INSERT/UPDATE/DELETE
drop policy if exists "Authenticated manage listings" on public.listings;
create policy "Authenticated manage listings"
  on public.listings for all
  to authenticated
  using (true)
  with check (true);

-- 3) Storage 버킷 (매물 사진) -----------------------------------------------
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- 공개 읽기
drop policy if exists "Public read listing-images" on storage.objects;
create policy "Public read listing-images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- 인증된 사용자만 업로드/수정/삭제
drop policy if exists "Authenticated upload listing-images" on storage.objects;
create policy "Authenticated upload listing-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images');

drop policy if exists "Authenticated update listing-images" on storage.objects;
create policy "Authenticated update listing-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'listing-images');

drop policy if exists "Authenticated delete listing-images" on storage.objects;
create policy "Authenticated delete listing-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'listing-images');
