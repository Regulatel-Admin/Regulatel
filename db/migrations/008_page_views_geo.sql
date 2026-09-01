ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device TEXT;
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views (country);
