-- Site-wide CMS content: hero, carousel, quick links, navigation, etc.
-- Consumed by GET/PUT /api/settings and by the public site when DB is the source.

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_updated ON site_settings(updated_at);

-- Gallery: albums and images for admin-managed gallery (optional; can also store in site_settings as gallery_albums key)
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

-- Allow audit log for site_settings updates
ALTER TABLE admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_resource_type_check;
ALTER TABLE admin_audit_log ADD CONSTRAINT admin_audit_log_resource_type_check
  CHECK (resource_type IN ('news', 'event', 'document', 'upload', 'admin_user', 'cifras', 'site_settings'));
