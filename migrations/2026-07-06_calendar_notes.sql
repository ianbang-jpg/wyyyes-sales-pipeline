-- 캘린더 간단 메모 (2026-07-06)

create table public.calendar_notes (
  id bigint generated always as identity primary key,
  note_date date not null,
  text text not null,
  author text,
  created_at timestamptz not null default now()
);

create index calendar_notes_date_idx on public.calendar_notes (note_date);

alter table public.calendar_notes enable row level security;

create policy "team full access calendar_notes" on public.calendar_notes
  for all to authenticated using (true) with check (true);

select 'calendar_notes ready' as status;
