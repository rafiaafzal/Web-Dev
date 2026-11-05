-- Notifications Table & RLS
-- Candidate notifications sent by recruiters on status transitions and interview scheduling

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  application_id uuid references applications(id) on delete cascade,
  type text not null check (type in ('shortlisted', 'rejected', 'interview_scheduled', 'selected', 'info')),
  title text not null,
  message text not null,
  data jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

-- Compound index for fast candidate notification queries and unread counting
create index if not exists idx_notifications_user_read_created
  on notifications (user_id, read, created_at desc);

alter table notifications enable row level security;

-- Policies: Users can read and update only their own notifications; recruiters can insert notifications
drop policy if exists notif_read_own on notifications;
create policy notif_read_own on notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notif_update_own on notifications;
create policy notif_update_own on notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists notif_insert_recruiter on notifications;
create policy notif_insert_recruiter on notifications
  for insert to authenticated
  with check (is_recruiter());
