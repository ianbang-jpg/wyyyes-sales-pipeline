-- 담당자 프로필 (아바타 이미지 + 개인 메모장) (2026-07-06)
-- avatar: 클라이언트에서 128px로 리사이즈한 data URL 저장 (스토리지 버킷 불필요)

create table public.profiles (
  owner text primary key,
  avatar text,
  memo text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "team full access profiles" on public.profiles
  for all to authenticated using (true) with check (true);

select 'profiles ready' as status;
