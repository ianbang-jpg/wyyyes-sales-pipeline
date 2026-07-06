alter table public.deliverables add column if not exists metrics_synced_at timestamptz;
select 'ok' as status;
