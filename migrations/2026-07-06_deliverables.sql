-- 인플루언서 협업 결과물 (유튜브/인스타/릴스 링크) (2026-07-06)

create table public.deliverables (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  url text not null,
  title text,
  posted_at date,
  author text,
  created_at timestamptz not null default now()
);

create index deliverables_lead_idx on public.deliverables (lead_id);

alter table public.deliverables enable row level security;

create policy "team full access deliverables" on public.deliverables
  for all to authenticated using (true) with check (true);

select 'deliverables ready' as status;
