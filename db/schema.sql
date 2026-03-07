-- REGULATEL Neon Postgres schema
-- Run this once to initialize the database (e.g. via Neon SQL Editor or psql).
-- Connection string must be set via DATABASE_URL (never in this file).

-- News (admin-created articles; static news remain in code)
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  "date" DATE NOT NULL,
  date_formatted TEXT,
  category TEXT DEFAULT 'Noticias',
  excerpt TEXT NOT NULL,
  image_url TEXT,
  image_file_name TEXT,
  image_mime_type TEXT,
  image_size INTEGER,
  additional_images JSONB DEFAULT '[]',
  additional_image_names JSONB DEFAULT '[]',
  additional_image_meta JSONB DEFAULT '[]',
  body TEXT NOT NULL,
  author TEXT,
  link TEXT,
  video_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_date ON news("date" DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published) WHERE published = true;

-- Events (admin-managed; seed used only when DB empty)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'past')),
  registration_url TEXT,
  details_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]',
  description TEXT,
  image_url TEXT,
  image_file_name TEXT,
  image_mime_type TEXT,
  image_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);

-- Documents (admin-added; static docs remain in code)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  year TEXT,
  quarter TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);

-- REGULATEL en cifras (por año): grupos de trabajo, comités, revista, países
CREATE TABLE IF NOT EXISTS cifras (
  year INTEGER PRIMARY KEY,
  grupos_trabajo INTEGER NOT NULL DEFAULT 0,
  comites_ejecutivos INTEGER NOT NULL DEFAULT 0,
  revista_digital INTEGER NOT NULL DEFAULT 0,
  paises INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Auditoría: quién hizo qué (crear, actualizar, eliminar, subir)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'uploaded')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('news', 'event', 'document', 'upload', 'admin_user')),
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON admin_audit_log(resource_type, resource_id);
