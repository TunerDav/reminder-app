-- RemindMe Database Setup Instructions
-- Run these commands in order

-- 1. Create database
CREATE DATABASE remindme;

-- 2. Connect to database
\c remindme

-- 3. Run schema (creates all tables, enums, indexes)
\i scripts/001-create-schema.sql

-- 4. Insert initial data (tags)
\i scripts/001-create-tables.sql

-- Done! Database is ready.
