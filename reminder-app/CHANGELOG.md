# Changelog

## [1.3.0] - 2026-01-28

### Added

- **Flexible monatliche Wiederholungen**: Event-Templates können jetzt auf "nth-Wochentag" Muster konfiguriert werden
  - Unterstützung für "Erster Freitag", "Zweiter Samstag", "Letzter Sonntag" etc.
  - Auswahl zwischen festem Datum (z.B. "15. des Monats") oder Wochentag-Muster
  - Automatische Slot-Generierung für beide Modi
- Neues Datenbankfeld `recurrence_week_of_month` für Event-Templates
- Verbesserte UI mit Toggle zwischen "Festes Datum" und "Wochentag" Modus
- Menschenlesbare Anzeige der Wiederholungsregeln (z.B. "monatlich - Zweiter Freitag")

### Technical

- Neue Hilfsfunktion `getNthWeekdayOfMonth()` für präzise Datumsberechnung
- Migration Script `004-add-recurrence-week-of-month.sql`
- Erweiterte TypeScript Types in `EventTemplateFlat`

## [1.2.6] - 2026-01-28

### Changed

- UI/UX: Standardized terminology across the application
- Navigation: "Erinnern" → "Erinnerungen", "Gruppen" → "Einladungen", "Events" → "Termine"
- Consistent use of "Menschen" instead of "Personen" or "Kontakte" throughout the app
- All dialogs and forms now use harmonized terminology
- Improved user experience with consistent labeling across all components

## [1.0.0] - 2026-01-28

### Added

- Initial release of Reminder App as Home Assistant Add-on
- Contact management system
- Family relationship tracking
- Relationship score tracking
- Smart reminders for birthdays, anniversaries, calls, and visits
- Event management with templates
- Invite groups for congregation activities
- Calendar view
- Tags and categories
- PostgreSQL database support
- Multi-architecture support (aarch64, amd64, armhf, armv7, i386)

### Features

- Modern React-based UI with Next.js
- Prisma ORM for database management
- Responsive design for mobile and desktop
- Dark mode support
- Real-time updates

### Requirements

- Home Assistant OS or Supervised
- PostgreSQL database (can use Home Assistant PostgreSQL add-on)
- Minimum 512MB RAM recommended
