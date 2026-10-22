-- Retirar un evento conserva sus datos y documentos para poder republicarlo.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS content_blocks JSONB,
  ADD COLUMN IF NOT EXISTS resources JSONB;
