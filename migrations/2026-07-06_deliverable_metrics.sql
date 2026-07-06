-- 결과물 측정 지표 (2026-07-06)
alter table public.deliverables add column if not exists views bigint;
alter table public.deliverables add column if not exists likes bigint;
alter table public.deliverables add column if not exists comments bigint;
alter table public.deliverables add column if not exists shares bigint;
select 'deliverable metrics ready' as status;
