-- =============================================================================
-- REGULATEL: Todas las tablas para el panel de admin (Neon)
-- =============================================================================
-- Ejecuta este archivo completo en el SQL Editor de Neon (copiar y pegar todo).
-- Crea o actualiza todas las tablas necesarias. Seguro para base nueva o existente.
-- =============================================================================

-- News
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

-- Events
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

-- Documents
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
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);

-- Site settings (hero, carousel, navegación, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated ON site_settings(updated_at);

-- Suscriptores
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token TEXT UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(lower(email));
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(unsubscribed_at) WHERE unsubscribed_at IS NULL;

-- REGULATEL en cifras
CREATE TABLE IF NOT EXISTS cifras (
  year INTEGER PRIMARY KEY,
  grupos_trabajo INTEGER NOT NULL DEFAULT 0,
  comites_ejecutivos INTEGER NOT NULL DEFAULT 0,
  revista_digital INTEGER NOT NULL DEFAULT 0,
  paises INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users y sesiones
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

-- Auditoría
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'uploaded')),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON admin_audit_log(resource_type, resource_id);

-- Constraint de resource_type (si la tabla ya existía sin él o con lista antigua)
ALTER TABLE admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_resource_type_check;
ALTER TABLE admin_audit_log ADD CONSTRAINT admin_audit_log_resource_type_check
  CHECK (resource_type IN ('news', 'event', 'document', 'upload', 'admin_user', 'cifras', 'site_settings'));

-- Galería
CREATE TABLE IF NOT EXISTS gallery_albums (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  "date" DATE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_slug ON gallery_albums(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_sort ON gallery_albums(sort_order);

CREATE TABLE IF NOT EXISTS gallery_images (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album ON gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_sort ON gallery_images(album_id, sort_order);

-- Document access (usuarios solo documentos)
CREATE TABLE IF NOT EXISTS document_access_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  institution TEXT,
  position TEXT,
  country TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_access_users_email ON document_access_users(lower(email));

CREATE TABLE IF NOT EXISTS document_access_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES document_access_users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_access_sessions_user_id ON document_access_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_sessions_expires_at ON document_access_sessions(expires_at);

CREATE TABLE IF NOT EXISTS document_access_requests (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  institution TEXT,
  position TEXT,
  country TEXT,
  document_id TEXT,
  document_title TEXT,
  collection_tipo TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dar_email ON document_access_requests(lower(email));
CREATE INDEX IF NOT EXISTS idx_dar_status ON document_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_dar_token ON document_access_requests(token_hash);

-- Visitas anónimas del sitio público (sin IP ni datos personales)
CREATE TABLE IF NOT EXISTS page_views (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_at ON page_views (visitor_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views (country);

ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS device TEXT;

-- Columnas que pudieron faltar en bases antiguas
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS image_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS image_size INTEGER,
  ADD COLUMN IF NOT EXISTS additional_image_meta JSONB DEFAULT '[]';

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS image_file_name TEXT,
  ADD COLUMN IF NOT EXISTS image_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS image_size INTEGER;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS cover_image TEXT;
