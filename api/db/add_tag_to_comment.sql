-- Add tag column to comment table
ALTER TABLE comment ADD COLUMN tag VARCHAR(255) NULL;

-- Add index for better performance on tag filtering
CREATE INDEX idx_comment_tag ON comment(tag);

-- Update existing comments to have null tag (optional - they will be null by default)
-- This is just for clarity and can be removed if not needed
UPDATE comment SET tag = NULL WHERE tag IS NULL; 