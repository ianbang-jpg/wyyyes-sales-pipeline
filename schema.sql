-- WYYYES 세일즈 파이프라인 스키마
-- Supabase SQL Editor에 전체 붙여넣기 후 Run

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'dealer' check (type in ('dealer', 'influencer')),
  name text not null,
  link text,
  channel text,
  channel_type text default '온라인' check (channel_type in ('온라인', '오프라인')),
  followers integer,
  shop_detail text,
  main_products text,
  contact_point text,
  contact_date date,
  stage text not null default '발굴' check (stage in ('발굴', '컨택', '응답확인', '협의중', '온보딩', '승인', '보류', '제외')),
  nickname text,
  approved_at date,
  owner text,
  notes text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  action text not null,
  detail text,
  actor text,
  created_at timestamptz not null default now()
);

create index activities_lead_id_idx on public.activities (lead_id, created_at desc);
create index leads_stage_idx on public.leads (stage);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- RLS: 로그인(공용 계정)한 사용자만 읽기/쓰기, 익명 차단
alter table public.leads enable row level security;
alter table public.activities enable row level security;

create policy "team full access leads" on public.leads
  for all to authenticated using (true) with check (true);

create policy "team full access activities" on public.activities
  for all to authenticated using (true) with check (true);

-- 실시간 반영 (다른 팀원 화면 자동 갱신)
alter publication supabase_realtime add table public.leads;
