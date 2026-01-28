# Home Assistant Add-on: Reminder App

## Zusammenfassung der erstellten Dateien

Alle notwendigen Dateien für das Home Assistant Add-on wurden erstellt:

### Add-on Kern-Dateien (`homeassistant/addon/`)

- ✅ **config.yaml** - Add-on Konfiguration mit Metadaten und Optionen
- ✅ **Dockerfile** - Multi-Arch Docker Image mit Next.js Build
- ✅ **run.sh** - Startscript mit Datenbank-Initialisierung
- ✅ **README.md** - Benutzer-Dokumentation
- ✅ **CHANGELOG.md** - Versionshistorie
- ✅ **apparmor.txt** - AppArmor Profil

### Repository-Dateien (`homeassistant/`)

- ✅ **repository.json** - Repository-Metadaten
- ✅ **README.md** - Repository-Dokumentation
- ✅ **build.sh** - Build-Script für alle Architekturen

### Projekt-Dateien

- ✅ **INSTALLATION.md** - Detaillierte Installations-Anleitung
- ✅ **.dockerignore** - Docker Build Optimierung

## Nächste Schritte

### 1. GitHub Repository erstellen

```bash
# Repository initialisieren (falls noch nicht geschehen)
git init
git add .
git commit -m "Initial commit with Home Assistant addon"

# GitHub Repository erstellen und pushen
git remote add origin https://github.com/DEIN_USERNAME/reminder-app.git
git branch -M main
git push -u origin main
```

### 2. Repository-URLs anpassen

Ersetze in folgenden Dateien `yourusername` mit deinem GitHub-Benutzernamen:

- `homeassistant/addon/config.yaml`
- `homeassistant/repository.json`
- `homeassistant/README.md`

### 3. Optional: Icons hinzufügen

Erstelle die folgenden Bilder für ein professionelles Erscheinungsbild:

- `homeassistant/addon/icon.png` (128x128 px)
- `homeassistant/addon/logo.png` (512x512 px)

### 4. Add-on in Home Assistant installieren

Folge der [INSTALLATION.md](../INSTALLATION.md) Anleitung:

1. PostgreSQL Add-on in Home Assistant installieren
2. Datenbank erstellen
3. Dieses Repository als Add-on Repository hinzufügen
4. Reminder App installieren und konfigurieren

## Unterstützte Architekturen

Das Add-on unterstützt folgende Plattformen:

- ✅ amd64 (x86_64)
- ✅ aarch64 (ARM 64-bit)
- ✅ armv7 (ARM 32-bit)
- ✅ armhf (ARM hard float)
- ✅ i386 (x86 32-bit)

## Features

- 📱 Responsive Web-UI
- 👨‍👩‍👧‍👦 Familien- und Kontaktverwaltung
- 🔔 Intelligente Erinnerungen
- 📅 Kalender und Event-Management
- 🏷️ Flexible Tags und Kategorien
- 📊 Beziehungs-Score Tracking
- 🗄️ PostgreSQL Datenbank
- 🌙 Dark Mode Support

## Technologie-Stack

- **Frontend**: React 19, Next.js 16
- **Backend**: Next.js Server Actions
- **Datenbank**: PostgreSQL mit Prisma ORM
- **UI**: Radix UI, Tailwind CSS
- **Deployment**: Docker Multi-Architecture

## Lizenz

MIT License
