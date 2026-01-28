# Repository-Struktur für Home Assistant Add-on

## ✅ Korrekte Struktur (jetzt implementiert)

Das Repository ist jetzt korrekt strukturiert. Home Assistant Add-ons benötigen die folgenden Dateien im **Root-Verzeichnis**:

```
reminder-app/                    # Root des Repositories
├── config.yaml                  # ✅ Add-on Konfiguration (WICHTIG!)
├── Dockerfile                   # ✅ Docker Build-Anleitung
├── run.sh                       # ✅ Startscript
├── README.md                    # ✅ Add-on Dokumentation
├── CHANGELOG.md                 # ✅ Versionshistorie
├── icon.png                     # ⚠️ Optional aber empfohlen
├── logo.png                     # ⚠️ Optional
├── apparmor.txt                 # ✅ Security-Profil
├── .dockerignore                # ✅ Docker Build-Optimierung
├── INSTALLATION.md              # 📖 Installations-Anleitung
├── package.json                 # App Dependencies
├── prisma/                      # Datenbank Schema
├── app/                         # Next.js App
├── components/                  # React Components
└── ...                          # Weitere App-Dateien
```

## 📋 Wichtige Dateien für Home Assistant

### 1. config.yaml (✅ VORHANDEN)
- **Pflicht**: Ja, absolut notwendig!
- **Zweck**: Definiert Add-on Metadaten, Konfigurationsoptionen, Ports
- **Status**: ✅ Im Root-Verzeichnis

### 2. Dockerfile (✅ VORHANDEN)
- **Pflicht**: Ja, für Add-on Build
- **Zweck**: Definiert wie das Add-on gebaut wird
- **Status**: ✅ Im Root-Verzeichnis, angepasst

### 3. run.sh (✅ VORHANDEN)
- **Pflicht**: Ja, für Add-on Start
- **Zweck**: Startscript mit Umgebungsvariablen
- **Status**: ✅ Im Root-Verzeichnis

### 4. README.md (✅ VORHANDEN)
- **Pflicht**: Empfohlen
- **Zweck**: Add-on Dokumentation für Benutzer
- **Status**: ✅ Im Root-Verzeichnis

### 5. icon.png (⚠️ FEHLT)
- **Pflicht**: Nein, aber sehr empfohlen
- **Größe**: 128x128 px
- **Zweck**: Icon im Add-on Store
- **Status**: ⚠️ Optional - siehe ICON-INFO.md

## 🧪 Testen der Repository-Struktur

### 1. Lokales Testing (Optional)

```bash
# Add-on lokal bauen
docker build -t test-reminder-app .

# Add-on lokal starten (benötigt PostgreSQL)
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  test-reminder-app
```

### 2. In Home Assistant testen

1. **Repository pushen**:
   ```bash
   git add .
   git commit -m "Fix add-on structure for Home Assistant"
   git push
   ```

2. **In Home Assistant hinzufügen**:
   - Gehe zu: Einstellungen → Add-ons → Add-on Store
   - Klicke auf ⋮ → Repositories
   - Füge hinzu: `https://github.com/TunerDav/reminder-app`
   - Klicke auf "Hinzufügen"

3. **Add-on sollte erscheinen**:
   - "Reminder App" sollte nun im Store sichtbar sein
   - Klicke drauf zum Installieren

## ❌ Häufige Fehler (behoben)

### ~~Problem 1: Add-on Dateien im Unterordner~~
**Vorher (falsch):**
```
homeassistant/
  addon/
    config.yaml    # ❌ Zu tief verschachtelt!
    Dockerfile
```

**Jetzt (korrekt):**
```
config.yaml          # ✅ Im Root!
Dockerfile           # ✅ Im Root!
```

### ~~Problem 2: Falscher Pfad im Dockerfile~~
**Vorher:** `COPY homeassistant/addon/run.sh /run.sh`  
**Jetzt:** `COPY run.sh /run.sh` ✅

## 🎯 Nächste Schritte

1. **Code zu GitHub pushen**:
   ```bash
   git add .
   git commit -m "Add Home Assistant add-on (correct structure)"
   git push
   ```

2. **Repository in Home Assistant hinzufügen**:
   - URL: `https://github.com/TunerDav/reminder-app`

3. **Add-on installieren und testen**

4. **Optional: Icon hinzufügen** (siehe ICON-INFO.md)

## 📝 Checkliste

- [x] config.yaml im Root
- [x] Dockerfile im Root
- [x] run.sh im Root
- [x] README.md im Root
- [x] CHANGELOG.md im Root
- [x] Dockerfile korrigiert (run.sh Pfad)
- [x] .dockerignore vorhanden
- [ ] icon.png hinzufügen (optional)
- [ ] Code zu GitHub pushen
- [ ] In Home Assistant testen

## ✅ Bereit für Installation!

Die Repository-Struktur ist jetzt korrekt. Du kannst den Code zu GitHub pushen und das Repository in Home Assistant als Add-on Repository hinzufügen.
