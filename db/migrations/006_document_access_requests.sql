-- Solicitudes de acceso a actas restringidas (autorizar / denegar por correo).
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
