-- Migration: Add Event Templates and Slots System
-- Created: 2026-01-26
-- Purpose: Wiederkehrende Einladungs-Events (JW Broadcasting, Gruppentreffpunkt, etc.)

-- Create event_templates table
CREATE TABLE IF NOT EXISTS event_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- z.B. 'jw-broadcasting', 'group-meeting', 'field-service', 'custom'
  recurrence_type VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'custom'
  recurrence_interval INTEGER DEFAULT 1, -- z.B. alle 2 Wochen = 2
  recurrence_day_of_week INTEGER, -- 0=Sonntag, 1=Montag, etc. (für wöchentlich)
  recurrence_day_of_month INTEGER, -- 1-31 (für monatlich)
  time_of_day TIME, -- Optionale Uhrzeit
  max_attendees INTEGER DEFAULT 1, -- Wie viele Personen pro Slot
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event_slots table (generierte Instanzen von Templates)
CREATE TABLE IF NOT EXISTS event_slots (
  id SERIAL PRIMARY KEY,
  event_template_id INTEGER NOT NULL REFERENCES event_templates(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TIME,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'assigned', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_template_id, slot_date) -- Ein Slot pro Template pro Datum
);

-- Junction table für Kontakte zu Event-Slots
CREATE TABLE IF NOT EXISTS event_slot_contacts (
  event_slot_id INTEGER NOT NULL REFERENCES event_slots(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response VARCHAR(20), -- 'accepted', 'declined', 'pending', null
  PRIMARY KEY (event_slot_id, contact_id)
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_event_slots_template_id ON event_slots(event_template_id);
CREATE INDEX IF NOT EXISTS idx_event_slots_date ON event_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_event_slots_status ON event_slots(status);
CREATE INDEX IF NOT EXISTS idx_event_slot_contacts_slot_id ON event_slot_contacts(event_slot_id);
CREATE INDEX IF NOT EXISTS idx_event_slot_contacts_contact_id ON event_slot_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_event_slot_contacts_family_id ON event_slot_contacts(family_id);

-- Composite Index für "anstehende verfügbare Slots"
CREATE INDEX IF NOT EXISTS idx_event_slots_upcoming ON event_slots(slot_date, status) 
  WHERE status = 'available' AND slot_date >= CURRENT_DATE;

-- Insert default event templates
INSERT INTO event_templates (name, description, category, recurrence_type, recurrence_day_of_month, time_of_day, max_attendees) VALUES
  ('JW Broadcasting', 'Monatliche JW Broadcasting Einladung', 'jw-broadcasting', 'monthly', 1, '19:00', 3),
  ('Gruppentreffpunkt', 'Gruppentreffpunkt für Predigtdienst', 'field-service', 'weekly', NULL, '09:00', 2)
ON CONFLICT DO NOTHING;
