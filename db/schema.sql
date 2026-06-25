-- Neon / Postgres schema for J.M.A. Motor Service
-- Run this in the Neon SQL Editor.

create extension if not exists pgcrypto;

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique not null,
  name text not null,
  phone text not null,
  email text,
  car_make_model text not null,
  service_needed text not null,
  preferred_date date,
  message text,
  email_sent boolean not null default false,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_service_requests_created_at
  on service_requests (created_at desc);

create index if not exists idx_service_requests_name
  on service_requests (name);

create index if not exists idx_service_requests_service_needed
  on service_requests (service_needed);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trg_service_requests_updated_at ON service_requests;
create trigger trg_service_requests_updated_at
before update on service_requests
for each row
execute function set_updated_at();
