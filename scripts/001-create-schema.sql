-- RemindMe App Database Schema
-- Complete schema with Families and Multi-Target Reminders

-- ======================
-- 1. ENUM TYPES
-- ======================

-- Reminder types
CREATE TYPE reminder_type AS ENUM (
    'birthday',
    'wedding_anniversary', 
    'call',
    'invite',
    'visit',
    'custom'
);

-- Repeat intervals
CREATE TYPE repeat_interval AS ENUM (
    'none',
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
);

-- Relationship types
CREATE TYPE relationship_type AS ENUM (
    'spouse',
    'child',
    'parent',
    'sibling',
    'grandparent',
    'grandchild',
    'other'
);

-- ======================
-- 2. BASE TABLES
-- ======================

-- Versammlungen (Congregations)
CREATE TABLE IF NOT EXISTS congregations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Familien (Families/Households)
CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,  -- z.B. "Familie Müller" oder "Ehepaar Schmidt"
    phone VARCHAR(50),            -- Gemeinsame Telefonnummer
    email VARCHAR(255),           -- Gemeinsame E-Mail
    address TEXT,                 -- Gemeinsame Adresse
    congregation_id INTEGER REFERENCES congregations(id) ON DELETE SET NULL,
    notes TEXT,
    photo_url TEXT,              -- Familienfoto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kontakte (Individual Contacts)
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    congregation_id INTEGER REFERENCES congregations(id) ON DELETE SET NULL,
    family_id INTEGER REFERENCES families(id) ON DELETE SET NULL,  -- Optional zu Familie gehörend
    birthday DATE,
    wedding_anniversary DATE,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags für Kategorisierung
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',  -- Hex color
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erinnerungen (Reminders) - OHNE direkte Verknüpfung zu Contacts/Families
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    type reminder_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    repeat repeat_interval DEFAULT 'none',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interaktions-Log
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,  -- 'call', 'visit', 'message', 'meeting'
    notes TEXT,
    interaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_interaction_target CHECK (
        (contact_id IS NOT NULL AND family_id IS NULL) OR 
        (contact_id IS NULL AND family_id IS NOT NULL)
    )
);

-- ======================
-- 3. JUNCTION TABLES
-- ======================

-- Contact Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS contact_tags (
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id, tag_id)
);

-- Family Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS family_tags (
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (family_id, tag_id)
);

-- Reminder → Contacts (Many-to-Many)
CREATE TABLE IF NOT EXISTS reminder_contacts (
    reminder_id INTEGER NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reminder_id, contact_id)
);

-- Reminder → Families (Many-to-Many)
CREATE TABLE IF NOT EXISTS reminder_families (
    reminder_id INTEGER NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reminder_id, family_id)
);

-- Contact Relationships (Verwandtschaftsbeziehungen)
CREATE TABLE IF NOT EXISTS contact_relationships (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    related_contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_relationship CHECK (contact_id != related_contact_id),
    CONSTRAINT unique_relationship UNIQUE (contact_id, related_contact_id, relationship_type)
);

-- ======================
-- 4. INDEXES
-- ======================

-- Congregations
CREATE INDEX IF NOT EXISTS idx_congregations_name ON congregations(name);

-- Families
CREATE INDEX IF NOT EXISTS idx_families_congregation ON families(congregation_id);
CREATE INDEX IF NOT EXISTS idx_families_name ON families(name);

-- Contacts
CREATE INDEX IF NOT EXISTS idx_contacts_congregation ON contacts(congregation_id);
CREATE INDEX IF NOT EXISTS idx_contacts_family ON contacts(family_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(first_name, last_name);

-- Reminders
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_completed ON reminders(completed);

-- Interactions
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_family ON interactions(family_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(interaction_date);

-- Tags
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag ON contact_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_family_tags_family ON family_tags(family_id);
CREATE INDEX IF NOT EXISTS idx_family_tags_tag ON family_tags(tag_id);

-- Reminder Targets
CREATE INDEX IF NOT EXISTS idx_reminder_contacts_reminder ON reminder_contacts(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_contacts_contact ON reminder_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_reminder_families_reminder ON reminder_families(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_families_family ON reminder_families(family_id);

-- Relationships
CREATE INDEX IF NOT EXISTS idx_contact_relationships_contact ON contact_relationships(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_relationships_related ON contact_relationships(related_contact_id);

