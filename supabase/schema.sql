-- Run once in the Supabase SQL editor.

create table if not exists public.quiz_responses (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  email         text not null,
  phone         text not null,
  top_gifts     text[] not null,
  disc_style    text not null,
  results       jsonb not null,
  answers       jsonb not null,
  emails_sent   int not null default 0
);

create index if not exists quiz_responses_created_at_idx on public.quiz_responses (created_at desc);

create table if not exists public.staff (
  email      text primary key,
  name       text,
  added_at   timestamptz not null default now()
);

alter table public.quiz_responses enable row level security;
alter table public.staff enable row level security;

-- Inserts and updates come only from the server with the service role key, which bypasses RLS.
-- Signed-in staff can read; nobody else can.
drop policy if exists "staff can read responses" on public.quiz_responses;
create policy "staff can read responses" on public.quiz_responses
  for select to authenticated
  using (exists (select 1 from public.staff s where lower(s.email) = lower(auth.jwt() ->> 'email')));

drop policy if exists "staff can see own staff row" on public.staff;
create policy "staff can see own staff row" on public.staff
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Add staff here (and invite the same email under Authentication → Users):
-- insert into public.staff (email, name) values ('someone@citychurchlufkin.com', 'Someone');
