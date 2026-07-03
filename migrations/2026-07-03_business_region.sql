-- 사업자 여부 / 지역 컬럼 추가 (2026-07-03)
-- 샵 상세(shop_detail)는 UI에서 제거하되 데이터는 보존 (CSV 내보내기에 포함)

alter table public.leads add column if not exists business text check (business in ('사업자', '개인'));
alter table public.leads add column if not exists region text;

select count(*) as total from public.leads;
