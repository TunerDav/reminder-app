-- Initial Data für RemindMe App
-- Standard-Tags für Zeugen Jehovas Kontext

INSERT INTO tags (name, color) VALUES
    ('Interessierte', '#10b981'),      -- Grün
    ('Bibelstudenten', '#3b82f6'),     -- Blau
    ('Getaufte', '#8b5cf6'),           -- Violett
    ('Inaktiv', '#ef4444'),            -- Rot
    ('Ehemalige', '#6b7280'),          -- Grau
    ('Familie', '#ec4899'),            -- Pink
    ('Nachbarn', '#f59e0b'),           -- Orange
    ('Kollegen', '#14b8a6'),           -- Teal
    ('Rückbesuche', '#a855f7')         -- Lila
ON CONFLICT (name) DO NOTHING;

