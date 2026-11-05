create extension if not exists vector;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('recruiter','candidate')),
  full_name text, email text, created_at timestamptz default now()
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'role','candidate'),
          new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do update set
    role = excluded.role,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create or replace function is_recruiter() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'recruiter')
$$;

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid references profiles(id),
  title text not null, department text, location text,
  type text default 'full-time', salary text, description text not null,
  skills jsonb not null default '[]',
  min_experience_years numeric default 0, qualifications text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz default now()
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references profiles(id),
  file_name text, file_path text, raw_text text, parsed jsonb,
  status text not null default 'parsed' check (status in ('parsed','failed','empty')),
  error text, created_at timestamptz default now()
);

create table if not exists resume_chunks (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references resumes(id) on delete cascade,
  kind text not null check (kind in ('skill','experience','project','education','summary')),
  content text not null, embedding vector(768)
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references profiles(id),
  resume_id uuid not null references resumes(id),
  status text not null default 'submitted' check (status in
    ('submitted','parsed','assessed','review','shortlisted','rejected','interview','selected')),
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (job_id, candidate_id)
);

create table if not exists assessments (   -- recruiter-only
  application_id uuid primary key references applications(id) on delete cascade,
  total_score numeric not null, breakdown jsonb not null, details jsonb not null,
  created_at timestamptz default now()
);

create table if not exists application_events (   -- audit trail
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  from_status text, to_status text not null,
  changed_by uuid references profiles(id), note text,
  created_at timestamptz default now()
);

create table if not exists recruiter_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  recruiter_id uuid not null references profiles(id),
  note text not null, created_at timestamptz default now()
);

create table if not exists interview_questions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  category text not null check (category in ('role','project')),
  question text not null, answer_guide text, created_at timestamptz default now()
);

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  interviewer_name text not null, scheduled_at timestamptz not null,
  duration_min int default 45, type text default 'technical',
  feedback jsonb, decision text check (decision in ('selected','rejected')),
  created_at timestamptz default now()
);

create or replace function match_chunks(query_embedding vector(768), match_count int default 20)
returns table (resume_id uuid, chunk_id uuid, kind text, content text, similarity float)
language sql stable as $$
  select resume_id, id, kind, content, 1 - (embedding <=> query_embedding)
  from resume_chunks where embedding is not null
  order by embedding <=> query_embedding limit match_count;
$$;

insert into storage.buckets (id, name, public) values ('resumes','resumes', false)
on conflict do nothing;

do $$ declare t text; begin
  for t in select unnest(array['profiles','jobs','resumes','resume_chunks','applications',
    'assessments','application_events','recruiter_notes','interview_questions','interviews']) loop
    execute format('alter table %I enable row level security', t);
  end loop; end $$;

-- Drop existing policies if re-running
drop policy if exists profiles_read on profiles;
drop policy if exists jobs_read on jobs;
drop policy if exists jobs_write on jobs;
drop policy if exists resumes_read on resumes;
drop policy if exists resumes_own_write on resumes;
drop policy if exists chunks_read on resume_chunks;
drop policy if exists apps_read on applications;
drop policy if exists apps_insert on applications;
drop policy if exists apps_recruiter_update on applications;
drop policy if exists assess_read on assessments;
drop policy if exists events_read on application_events;
drop policy if exists events_insert on application_events;
drop policy if exists notes_all on recruiter_notes;
drop policy if exists questions_all on interview_questions;
drop policy if exists interviews_all on interviews;

create policy profiles_read on profiles for select to authenticated using (id = auth.uid() or is_recruiter());
create policy jobs_read on jobs for select to authenticated using (true);
create policy jobs_write on jobs for all to authenticated
  using (is_recruiter() and (recruiter_id = auth.uid() or recruiter_id is null))
  with check (is_recruiter() and (recruiter_id = auth.uid() or recruiter_id is null));
create policy resumes_read on resumes for select to authenticated using (candidate_id = auth.uid() or is_recruiter());
create policy resumes_own_write on resumes for all to authenticated
  using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy chunks_read on resume_chunks for select to authenticated
  using (is_recruiter() or exists (select 1 from resumes r where r.id = resume_id and r.candidate_id = auth.uid()));
create policy apps_read on applications for select to authenticated using (candidate_id = auth.uid() or is_recruiter());
create policy apps_insert on applications for insert to authenticated
  with check (candidate_id = auth.uid() and status = 'submitted');
create policy apps_recruiter_update on applications for update to authenticated
  using (is_recruiter()) with check (is_recruiter());
create policy assess_read on assessments for select to authenticated using (is_recruiter());
create policy events_read on application_events for select to authenticated using (is_recruiter());
create policy events_insert on application_events for insert to authenticated with check (is_recruiter());
create policy notes_all on recruiter_notes for all to authenticated using (is_recruiter()) with check (is_recruiter());
create policy questions_all on interview_questions for all to authenticated using (is_recruiter()) with check (is_recruiter());
create policy interviews_all on interviews for all to authenticated using (is_recruiter()) with check (is_recruiter());

-- Demo Job from AGENT.md scenario (Backend Developer: Python, Django, PostgreSQL, Docker)
insert into jobs (id, title, department, location, type, salary, description, skills, min_experience_years, qualifications, status)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Senior Backend Engineer',
  'Engineering',
  'Remote',
  'full-time',
  '$120,000 - $145,000',
  'We are seeking a Backend Developer to build robust, scalable APIs and microservices. You will collaborate with cross-functional teams to design database schemas, containerize applications, and maintain cloud infrastructure.',
  '[
    {"name": "Python", "importance": 5, "required": true},
    {"name": "Django", "importance": 4, "required": true},
    {"name": "PostgreSQL", "importance": 4, "required": true},
    {"name": "Docker", "importance": 3, "required": true}
  ]'::jsonb,
  3,
  'B.S. in Computer Science, Software Engineering, or equivalent practical experience',
  'open'
) on conflict (id) do nothing;
