-- ============================================================================
-- J.M.A. Motor Service — Neon PostgreSQL schema
-- ============================================================================
-- Run this once against your Neon database (e.g. via the Neon SQL Editor or
-- `psql $DATABASE_URL -f db/schema.sql`).
--
-- Re-running this script is safe: every statement is idempotent.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS service_requests (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name       TEXT         NOT NULL,
  phone               TEXT         NOT NULL,
  email               TEXT,
  car_make_model      TEXT         NOT NULL,
  service_needed      TEXT         NOT NULL,
  preferred_date      DATE,
  message             TEXT,
  selected_language   TEXT         NOT NULL DEFAULT 'en',
  status              TEXT         NOT NULL DEFAULT 'new',
  source              TEXT         NOT NULL DEFAULT 'website',
  email_sent          BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE service_requests
  DROP CONSTRAINT IF EXISTS service_requests_status_chk;
ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_status_chk
  CHECK (status IN ('new', 'contacted', 'confirmed', 'completed', 'cancelled'));

ALTER TABLE service_requests
  DROP CONSTRAINT IF EXISTS service_requests_lang_chk;
ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_lang_chk
  CHECK (selected_language IN ('en', 'so'));

CREATE INDEX IF NOT EXISTS service_requests_created_at_idx
  ON service_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS service_requests_status_idx
  ON service_requests (status);

CREATE INDEX IF NOT EXISTS service_requests_phone_idx
  ON service_requests (phone);

CREATE OR REPLACE FUNCTION service_requests_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_requests_updated_at_trg ON service_requests;
CREATE TRIGGER service_requests_updated_at_trg
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION service_requests_set_updated_at();
