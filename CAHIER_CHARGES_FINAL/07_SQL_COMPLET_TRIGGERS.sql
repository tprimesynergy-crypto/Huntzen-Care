-- ============================================================
-- HUNTZEN CARE - SCHEMA SQL COMPLET + TRIGGERS
-- Version: 1.0
-- Base: PostgreSQL 15+
-- ============================================================

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE role_key AS ENUM (
    'R1_PSG_SUPER',
    'R2_HUNTZEN_ADMIN',
    'R3_COMPANY_RH',
    'R4_PRACTITIONER',
    'R5_EMPLOYEE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE consultation_status AS ENUM (
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE consultation_type AS ENUM (
    'video',
    'phone',
    'in_person',
    'chat'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLES CORE
-- ============================================================

-- ROLES
CREATE TABLE IF NOT EXISTS roles (
  id SMALLSERIAL PRIMARY KEY,
  key role_key UNIQUE NOT NULL,
  label TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (key, label, permissions)
VALUES
  ('R1_PSG_SUPER', 'Super Super Admin (PSG)', '{}'),
  ('R2_HUNTZEN_ADMIN', 'Admin HuntZen', '{}'),
  ('R3_COMPANY_RH', 'Admin Entreprise (RH)', '{}'),
  ('R4_PRACTITIONER', 'Praticien', '{}'),
  ('R5_EMPLOYEE', 'Employé', '{}')
ON CONFLICT (key) DO NOTHING;

-- COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain_email TEXT NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country_code CHAR(2) DEFAULT 'FR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_domain_email ON companies(domain_email);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role_id SMALLINT NOT NULL REFERENCES roles(id),
  company_id UUID REFERENCES companies(id),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- REFRESH TOKENS
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- ============================================================
-- PRACTITIONERS
-- ============================================================
CREATE TABLE IF NOT EXISTS practitioner_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  specialties TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  languages TEXT[] NOT NULL DEFAULT ARRAY['fr']::text[],
  city TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practitioner_verified ON practitioner_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_practitioner_specialties ON practitioner_profiles USING GIN(specialties);

CREATE TABLE IF NOT EXISTS practitioner_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pract_docs_practitioner ON practitioner_documents(practitioner_id, created_at DESC);

-- ============================================================
-- AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slots_practitioner_dow ON availability_slots(practitioner_id, day_of_week);

CREATE TABLE IF NOT EXISTS availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exceptions_practitioner_date ON availability_exceptions(practitioner_id, exception_date);

-- ============================================================
-- CONSULTATIONS (COEUR DU SYSTÈME)
-- ============================================================
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type consultation_type NOT NULL DEFAULT 'video',
  status consultation_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  jitsi_room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consult_company_date ON consultations(company_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_consult_employee_date ON consultations(employee_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_consult_pract_date ON consultations(practitioner_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_consult_status_date ON consultations(status, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_consult_started_ended ON consultations(started_at, ended_at) WHERE status = 'completed';

-- ============================================================
-- COMPTEURS DAILY (AGRÉGATIONS)
-- ============================================================
CREATE TABLE IF NOT EXISTS practitioner_activity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  consult_count INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds BIGINT NOT NULL DEFAULT 0,
  UNIQUE(practitioner_id, day)
);

CREATE INDEX IF NOT EXISTS idx_pract_activity_day ON practitioner_activity_daily(day DESC);
CREATE INDEX IF NOT EXISTS idx_pract_activity_practitioner ON practitioner_activity_daily(practitioner_id, day DESC);

CREATE TABLE IF NOT EXISTS employee_activity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  consult_count INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds BIGINT NOT NULL DEFAULT 0,
  UNIQUE(employee_id, day)
);

CREATE INDEX IF NOT EXISTS idx_emp_activity_day ON employee_activity_daily(day DESC);
CREATE INDEX IF NOT EXISTS idx_emp_activity_employee ON employee_activity_daily(employee_id, day DESC);
CREATE INDEX IF NOT EXISTS idx_emp_activity_company ON employee_activity_daily(company_id, day DESC);

CREATE TABLE IF NOT EXISTS company_activity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  consult_count INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds BIGINT NOT NULL DEFAULT 0,
  active_users_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(company_id, day)
);

CREATE INDEX IF NOT EXISTS idx_company_activity_day ON company_activity_daily(day DESC);
CREATE INDEX IF NOT EXISTS idx_company_activity_company ON company_activity_daily(company_id, day DESC);

-- ============================================================
-- CHAT (ENCRYPTED)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_users ON chat_threads(user1_id, user2_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_encrypted BYTEA,
  iv BYTEA,
  auth_tag BYTEA,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_time ON chat_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON chat_messages(receiver_id, read_at, created_at DESC);

-- ============================================================
-- MEDICAL DATA (ENCRYPTED)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID UNIQUE NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_encrypted BYTEA NOT NULL,
  iv BYTEA NOT NULL,
  auth_tag BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_pract_time ON clinical_notes(practitioner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_consultation ON clinical_notes(consultation_id);

CREATE TABLE IF NOT EXISTS employee_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_encrypted BYTEA NOT NULL,
  iv BYTEA NOT NULL,
  auth_tag BYTEA NOT NULL,
  mood_rating SMALLINT CHECK (mood_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journals_emp_time ON employee_journals(employee_id, created_at DESC);

-- ============================================================
-- CONTENT / BLOG / NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'company')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_scope_published ON articles(scope, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_company_published ON articles(company_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- ============================================================
-- AUDIT & SECURITY
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_company_time ON audit_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at DESC);

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip INET,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_time ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_severity ON security_events(severity, created_at DESC);

-- ============================================================
-- TRIGGERS : UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TRIGGER CRITIQUE : CALCUL DURÉE + AGRÉGATIONS
-- ============================================================
CREATE OR REPLACE FUNCTION finalize_consultation_and_aggregate()
RETURNS TRIGGER AS $$
DECLARE
  d DATE;
  dur INTEGER;
BEGIN
  -- Trigger uniquement quand status devient 'completed'
  IF (TG_OP = 'UPDATE')
     AND (NEW.status = 'completed')
     AND (OLD.status IS DISTINCT FROM NEW.status) THEN

    IF NEW.started_at IS NULL OR NEW.ended_at IS NULL THEN
      RAISE EXCEPTION 'Cannot complete consultation without started_at and ended_at';
    END IF;

    -- Calcul durée
    dur := GREATEST(0, EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INT);
    NEW.duration_seconds := dur;

    -- Date du jour (UTC)
    d := (NEW.started_at AT TIME ZONE 'UTC')::DATE;

    -- AGRÉGATION 1: Praticien
    INSERT INTO practitioner_activity_daily (practitioner_id, day, consult_count, total_duration_seconds)
    VALUES (NEW.practitioner_id, d, 1, dur)
    ON CONFLICT (practitioner_id, day)
    DO UPDATE SET
      consult_count = practitioner_activity_daily.consult_count + 1,
      total_duration_seconds = practitioner_activity_daily.total_duration_seconds + EXCLUDED.total_duration_seconds;

    -- AGRÉGATION 2: Employé
    INSERT INTO employee_activity_daily (employee_id, company_id, day, consult_count, total_duration_seconds)
    VALUES (NEW.employee_id, NEW.company_id, d, 1, dur)
    ON CONFLICT (employee_id, day)
    DO UPDATE SET
      consult_count = employee_activity_daily.consult_count + 1,
      total_duration_seconds = employee_activity_daily.total_duration_seconds + EXCLUDED.total_duration_seconds;

    -- AGRÉGATION 3: Entreprise
    INSERT INTO company_activity_daily (company_id, day, consult_count, total_duration_seconds, active_users_count)
    VALUES (NEW.company_id, d, 1, dur, 0)
    ON CONFLICT (company_id, day)
    DO UPDATE SET
      consult_count = company_activity_daily.consult_count + 1,
      total_duration_seconds = company_activity_daily.total_duration_seconds + EXCLUDED.total_duration_seconds;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_consultations_complete_aggregate
  BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION finalize_consultation_and_aggregate();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- FONCTION : Rafraîchir active_users_count (CRON daily)
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_company_active_users(p_day DATE)
RETURNS VOID AS $$
BEGIN
  UPDATE company_activity_daily cad
  SET active_users_count = sub.cnt
  FROM (
    SELECT company_id, COUNT(*) AS cnt
    FROM users
    WHERE company_id IS NOT NULL
      AND is_active = TRUE
      AND role_id = (SELECT id FROM roles WHERE key='R5_EMPLOYEE' LIMIT 1)
    GROUP BY company_id
  ) sub
  WHERE cad.company_id = sub.company_id
    AND cad.day = p_day;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - RECOMMANDÉ
-- ============================================================

-- Activer RLS sur tables médicales
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Praticien accède uniquement à ses notes
CREATE POLICY practitioner_only_own_notes ON clinical_notes
  USING (practitioner_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Policy: Employé accède uniquement à son journal
CREATE POLICY employee_only_own_journal ON employee_journals
  USING (employee_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Policy: Chat accessible aux participants uniquement
CREATE POLICY chat_participants_only ON chat_messages
  USING (
    sender_id = current_setting('app.current_user_id', TRUE)::UUID
    OR receiver_id = current_setting('app.current_user_id', TRUE)::UUID
  );

COMMIT;

-- ============================================================
-- REQUÊTES UTILES (EXEMPLES)
-- ============================================================

-- Compteurs praticien sur période
/*
SELECT
  practitioner_id,
  SUM(consult_count) AS consultations,
  SUM(total_duration_seconds) AS total_seconds,
  SUM(total_duration_seconds) / 60 AS total_minutes
FROM practitioner_activity_daily
WHERE practitioner_id = $1
  AND day BETWEEN $2 AND $3
GROUP BY practitioner_id;
*/

-- Compteurs employé sur période
/*
SELECT
  employee_id,
  SUM(consult_count) AS consultations,
  SUM(total_duration_seconds) AS total_seconds
FROM employee_activity_daily
WHERE employee_id = $1
  AND day BETWEEN $2 AND $3
GROUP BY employee_id;
*/

-- Compteurs entreprise sur période
/*
SELECT
  company_id,
  SUM(consult_count) AS consultations,
  SUM(total_duration_seconds) AS total_seconds,
  AVG(active_users_count) AS avg_active_users
FROM company_activity_daily
WHERE company_id = $1
  AND day BETWEEN $2 AND $3
GROUP BY company_id;
*/

-- ============================================================
-- FIN DU SCHEMA
-- ============================================================
