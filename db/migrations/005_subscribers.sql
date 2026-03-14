-- Suscriptores a actualizaciones (noticias, eventos, publicaciones).
-- Usado por la página Suscribirse y para envío de notificaciones por correo.

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(lower(email));
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(unsubscribed_at) WHERE unsubscribed_at IS NULL;
