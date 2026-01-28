-- Migration: Add Tags System
-- Created: 2026-01-26

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL DEFAULT '#3b82f6', -- hex color code
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (contact_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag_id ON contact_tags(tag_id);

-- Insert default tags for Zeugen Jehovas context
INSERT INTO tags (name, color) VALUES
  ('Interessierte', '#10b981'),
  ('Bibelstudenten', '#3b82f6'),
  ('Getaufte', '#8b5cf6'),
  ('Inaktiv', '#ef4444'),
  ('Ehemalige', '#6b7280'),
  ('Familie', '#ec4899'),
  ('Nachbarn', '#f59e0b')
ON CONFLICT (name) DO NOTHING;
