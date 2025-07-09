-- Migration: Add image_url column to comment table
-- Date: 2024-01-20
-- Description: Add support for images in comments

ALTER TABLE comment 
ADD COLUMN image_url VARCHAR(255) NULL;

-- Add comment to describe the column
COMMENT ON COLUMN comment.image_url IS 'URL of the image attached to the comment'; 