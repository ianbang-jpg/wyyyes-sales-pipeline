-- 완료 건 아카이빙 (2026-07-08)
alter table public.leads add column if not exists archived_at timestamptz;
create index if not exists leads_archived_idx on public.leads (archived_at);
select 'archive ready' as status;
