-- v2 기능: 다음 액션 / 단계 체류 추적 / 중요 표시 / 종료 사유 (2026-07-03)

alter table public.leads add column if not exists next_action text;
alter table public.leads add column if not exists next_action_due date;
alter table public.leads add column if not exists stage_changed_at timestamptz;
alter table public.leads add column if not exists starred boolean not null default false;
alter table public.leads add column if not exists closed_reason text;

-- 체류 시작 시점 백필 (기존 건은 마지막 수정 시점으로 근사)
update public.leads set stage_changed_at = updated_at where stage_changed_at is null;

select count(*) as total, count(stage_changed_at) as with_stage_ts from public.leads;
