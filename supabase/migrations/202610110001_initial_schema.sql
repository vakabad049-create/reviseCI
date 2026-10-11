-- RéviseCI — fondations de données (Supabase/PostgreSQL)
-- Appliquer cette migration dans un projet Supabase configuré.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  country text not null default 'Côte d’Ivoire',
  institution text,
  study_field text,
  study_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  original_filename text not null,
  storage_path text not null unique,
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 20971520),
  status text not null default 'uploaded'
    check (status in ('uploaded', 'processing', 'ready', 'failed')),
  extraction_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  kind text not null check (kind in ('summary', 'key_points', 'flashcards', 'mcq', 'open_questions', 'exercises', 'mock_exam')),
  content jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  material_id uuid references public.study_materials(id) on delete set null,
  score numeric(5,2) check (score >= 0 and score <= 100),
  total_questions integer not null default 0 check (total_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0 and correct_answers <= total_questions),
  answers jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create index if not exists courses_user_created_idx on public.courses(user_id, created_at desc);
create index if not exists materials_user_course_idx on public.study_materials(user_id, course_id, created_at desc);
create index if not exists sessions_user_completed_idx on public.study_sessions(user_id, completed_at desc);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.study_materials enable row level security;
alter table public.study_sessions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "courses_select_own" on public.courses;
create policy "courses_select_own" on public.courses for select to authenticated using (auth.uid() = user_id);
drop policy if exists "courses_insert_own" on public.courses;
create policy "courses_insert_own" on public.courses for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "courses_update_own" on public.courses;
create policy "courses_update_own" on public.courses for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "courses_delete_own" on public.courses;
create policy "courses_delete_own" on public.courses for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "materials_select_own" on public.study_materials;
create policy "materials_select_own" on public.study_materials for select to authenticated using (auth.uid() = user_id);
drop policy if exists "materials_insert_own" on public.study_materials;
create policy "materials_insert_own" on public.study_materials for insert to authenticated with check (
  auth.uid() = user_id and exists (
    select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()
  )
);
drop policy if exists "materials_delete_own" on public.study_materials;
create policy "materials_delete_own" on public.study_materials for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "sessions_select_own" on public.study_sessions;
create policy "sessions_select_own" on public.study_sessions for select to authenticated using (auth.uid() = user_id);
drop policy if exists "sessions_insert_own" on public.study_sessions;
create policy "sessions_insert_own" on public.study_sessions for insert to authenticated with check (
  auth.uid() = user_id and exists (
    select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()
  )
);

-- Création automatique d’un profil à l’inscription.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bucket privé : chaque PDF est rangé sous <user_id>/<nom-du-fichier>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-pdfs', 'course-pdfs', false, 20971520, array['application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = array['application/pdf'];

drop policy if exists "course_pdfs_read_own" on storage.objects;
create policy "course_pdfs_read_own" on storage.objects for select to authenticated
using (bucket_id = 'course-pdfs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "course_pdfs_insert_own" on storage.objects;
create policy "course_pdfs_insert_own" on storage.objects for insert to authenticated
with check (bucket_id = 'course-pdfs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "course_pdfs_delete_own" on storage.objects;
create policy "course_pdfs_delete_own" on storage.objects for delete to authenticated
using (bucket_id = 'course-pdfs' and (storage.foldername(name))[1] = auth.uid()::text);
