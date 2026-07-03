-- 단계 체계 개편 + 카테고리 컬럼 추가 (2026-07-02)
-- 딜러:      발굴 → 컨택 → 응답 → 협의 → 승인 → 판매
-- 인플루언서: 발굴 → 컨택 → 응답 → 협의 → 계약 → 진행 → 완료
-- 공통 종료: 보류, 제외

-- 1) 카테고리 컬럼
alter table public.leads add column if not exists category text;

-- 2) 기존 stage 제약 해제
alter table public.leads drop constraint if exists leads_stage_check;

-- 3) 데이터 마이그레이션
update public.leads set stage = '응답' where stage = '응답확인';
update public.leads set stage = '협의' where stage = '협의중';
update public.leads set stage = case when type = 'dealer' then '승인' else '계약' end where stage = '온보딩';
update public.leads set stage = '계약' where stage = '승인' and type = 'influencer';

-- 4) 새 제약
alter table public.leads add constraint leads_stage_check
  check (stage in ('발굴', '컨택', '응답', '협의', '승인', '판매', '계약', '진행', '완료', '보류', '제외'));

-- 5) 카테고리 백필: 딜러 발굴 시트는 전원 피규어 딜러
update public.leads set category = '피규어' where type = 'dealer' and category is null;

-- 확인
select type, stage, count(*) from public.leads group by 1, 2 order by 1, 2;
