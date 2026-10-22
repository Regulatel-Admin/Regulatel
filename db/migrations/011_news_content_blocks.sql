-- Ordered visual article content. Existing articles keep their legacy renderer.
ALTER TABLE news ADD COLUMN IF NOT EXISTS content_blocks JSONB;
