# ✅ Korrekte Home Assistant Add-on Repository Struktur

## Problem gelöst

Die Repository-Struktur wurde korrigiert gemäß der [offiziellen Home Assistant Dokumentation](https://developers.home-assistant.io/docs/add-ons/repository/).

## Korrekte Struktur

```
reminder-app/                      # GitHub Repository Root
├── repository.yaml               # ✅ Repository-Konfiguration (PFLICHT!)
├── reminder-app/                 # ✅ Add-on Verzeichnis
│   ├── config.yaml              # ✅ Add-on Konfiguration
│   ├── Dockerfile               # ✅ Docker Build
│   ├── run.sh                   # ✅ Startscript
│   ├── README.md                # ✅ Add-on Dokumentation
│   ├── CHANGELOG.md             # ✅ Versionshistorie
│   └── apparmor.txt             # ✅ Security-Profil
├── README.md                     # Repository README
├── INSTALLATION.md               # Installations-Anleitung
├── package.json                  # App Dependencies
├── app/                          # Next.js App
├── components/                   # React Components
├── prisma/                       # Datenbank Schema
└── ...                           # Weitere App-Dateien
```

## Wichtige Änderungen

1. **repository.yaml im Root** (vorher: repository.json)
   - Format: YAML statt JSON
   - Enthält Repository-Metadaten

2. **Add-on in eigenem Ordner** (reminder-app/)
   - Alle Add-on spezifischen Dateien sind hier
   - Name des Ordners sollte mit `slug` in config.yaml übereinstimmen

3. **Dockerfile angepasst**
   - Kopiert Dateien aus dem Repository-Root
   - Verwendet relative Pfade: `../../`

## Nächste Schritte

```bash
# Code committen und pushen
git add .
git commit -m "Fix repository structure according to Home Assistant guidelines"
git push
```

## In Home Assistant testen

Nach dem Push:

1. Gehe zu: **Einstellungen → Add-ons → Add-on Store**
2. Klicke auf **⋮ → Repositories**
3. Füge hinzu: `https://github.com/TunerDav/reminder-app`
4. Das Repository sollte jetzt erkannt werden
5. "Reminder App" sollte im Store erscheinen

## Referenz

- [Official Documentation](https://developers.home-assistant.io/docs/add-ons/repository/)
- [Example Repository](https://github.com/home-assistant/addons-example)
