create extension if not exists "pgcrypto";

create table if not exists public.buses (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  bus_id uuid references public.buses(id),
  stop_lat double precision,
  stop_lng double precision
);

alter table public.buses
  add column if not exists name text;

alter table public.students
  add column if not exists email text,
  add column if not exists bus_id uuid references public.buses(id),
  add column if not exists stop_lat double precision,
  add column if not exists stop_lng double precision;

create table if not exists public.bus_locations (
  id uuid primary key default gen_random_uuid(),
  bus_id uuid not null references public.buses(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  updated_at timestamptz not null default now(),
  unique (bus_id)
);

alter table public.students
  add column if not exists bus_id uuid references public.buses(id),
  add column if not exists stop_lat double precision,
  add column if not exists stop_lng double precision;

alter table public.buses enable row level security;
alter table public.students enable row level security;
alter table public.bus_locations enable row level security;

drop policy if exists "Allow authenticated read buses" on public.buses;
create policy "Allow authenticated read buses"
on public.buses
for select
to authenticated
using (true);

drop policy if exists "Allow authenticated read students" on public.students;
create policy "Allow authenticated read students"
on public.students
for select
to authenticated
using (true);

drop policy if exists "Allow authenticated insert own student profile" on public.students;
create policy "Allow authenticated insert own student profile"
on public.students
for insert
to authenticated
with check (lower(email) = lower((auth.jwt() ->> 'email')));

drop policy if exists "Allow authenticated update own student profile" on public.students;
create policy "Allow authenticated update own student profile"
on public.students
for update
to authenticated
using (lower(email) = lower((auth.jwt() ->> 'email')))
with check (lower(email) = lower((auth.jwt() ->> 'email')));

drop policy if exists "Allow read bus locations" on public.bus_locations;
create policy "Allow read bus locations"
on public.bus_locations
for select
to authenticated
using (true);

drop policy if exists "Allow authenticated drivers upsert bus locations" on public.bus_locations;
create policy "Allow authenticated drivers upsert bus locations"
on public.bus_locations
for insert
to authenticated
with check (true);

drop policy if exists "Allow authenticated drivers update bus locations" on public.bus_locations;
create policy "Allow authenticated drivers update bus locations"
on public.bus_locations
for update
to authenticated
using (true)
with check (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bus_locations'
  ) then
    alter publication supabase_realtime add table public.bus_locations;
  end if;
end $$;

insert into public.buses (id, name)
values ('11111111-1111-1111-1111-111111111111', 'Bus 1')
on conflict (id) do update
set name = excluded.name;

insert into public.students (id, name, email, bus_id, stop_lat, stop_lng)
values (
  '22222222-2222-2222-2222-222222222222',
  'Test Student',
  'test@example.com',
  '11111111-1111-1111-1111-111111111111',
  11.0183,
  76.9558
)
on conflict (id) do update
set
  email = excluded.email,
  bus_id = excluded.bus_id,
  stop_lat = excluded.stop_lat,
  stop_lng = excluded.stop_lng;

insert into public.students (id, name, email, bus_id, stop_lat, stop_lng)
values (
  '33333333-3333-3333-3333-333333333333',
  'Student One',
  'student1@example.com',
  '11111111-1111-1111-1111-111111111111',
  11.0183,
  76.9558
)
on conflict (id) do update
set
  email = excluded.email,
  bus_id = excluded.bus_id,
  stop_lat = excluded.stop_lat,
  stop_lng = excluded.stop_lng;

insert into public.bus_locations (bus_id, latitude, longitude)
values ('11111111-1111-1111-1111-111111111111', 11.0183, 76.9558)
on conflict (bus_id) do update
set
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  updated_at = now();

select id, name from public.buses;
select id, email, bus_id, stop_lat, stop_lng from public.students;
select id, bus_id, latitude, longitude, updated_at from public.bus_locations;
