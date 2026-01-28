# Home Assistant Add-on Installation

Diese Anleitung erklärt, wie du die Reminder App als Home Assistant Add-on installierst.

## Voraussetzungen

1. **Home Assistant OS oder Supervised** Installation
2. **PostgreSQL Datenbank** - Du kannst entweder:
   - Das offizielle PostgreSQL Add-on von Home Assistant nutzen (empfohlen)
   - Eine externe PostgreSQL-Instanz verwenden

## Schritt 1: PostgreSQL einrichten

### Option A: PostgreSQL Add-on installieren (Empfohlen)

1. Öffne Home Assistant
2. Gehe zu **Einstellungen** → **Add-ons** → **Add-on Store**
3. Suche nach "PostgreSQL"
4. Installiere das offizielle PostgreSQL Add-on
5. Konfiguriere das Add-on:
   ```yaml
   databases:
     - reminderapp
   logins:
     - username: reminderapp
       password: DEIN_SICHERES_PASSWORT
   rights:
     - username: reminderapp
       database: reminderapp
   ```
6. Starte das PostgreSQL Add-on

### Option B: Externe PostgreSQL-Datenbank

Wenn du bereits eine PostgreSQL-Instanz hast, erstelle eine neue Datenbank:

```sql
CREATE DATABASE reminderapp;
CREATE USER reminderapp WITH ENCRYPTED PASSWORD 'DEIN_PASSWORT';
GRANT ALL PRIVILEGES ON DATABASE reminderapp TO reminderapp;
```

## Schritt 2: Addon-Repository hinzufügen

1. Öffne Home Assistant
2. Gehe zu **Einstellungen** → **Add-ons** → **Add-on Store**
3. Klicke auf die drei Punkte ⋮ oben rechts
4. Wähle **Repositories**
5. Füge die Repository-URL hinzu:
   ```
   https://github.com/DEIN_USERNAME/reminder-app
   ```
   > **Hinweis**: Ersetze `DEIN_USERNAME` mit deinem GitHub-Benutzernamen, wenn du das Repository dort hostest

## Schritt 3: Reminder App installieren

1. Im Add-on Store sollte nun "Reminder App" erscheinen
2. Klicke auf "Reminder App"
3. Klicke auf **Installieren**
4. Warte, bis die Installation abgeschlossen ist

## Schritt 4: Add-on konfigurieren

1. Gehe zum **Configuration** Tab des Add-ons
2. Passe die Konfiguration an:

```yaml
postgres_host: POSTGRES_HOST
postgres_port: 5432
postgres_db: reminderapp
postgres_user: reminderapp
postgres_password: DEIN_PASSWORT
node_env: production
port: 3000
```

**Werte anpassen:**

- `postgres_host`:
  - Bei PostgreSQL Add-on: `a0d7b954-postgresql` (oder ähnlich, prüfe den Service-Namen)
  - Bei externer DB: IP-Adresse oder Hostname
- `postgres_password`: Dein gewähltes Passwort
- Andere Werte kannst du bei Bedarf anpassen

## Schritt 5: Add-on starten

1. Klicke auf **Start**
2. Aktiviere optional:
   - **Start on boot** - Automatischer Start beim Systemstart
   - **Watchdog** - Automatischer Neustart bei Problemen
   - **Auto update** - Automatische Updates
3. Prüfe die Logs auf Fehler

## Schritt 6: Auf die App zugreifen

Nach erfolgreichem Start:

1. Klicke auf **Open Web UI** im Add-on
2. Oder öffne im Browser: `http://homeassistant.local:3000`

## Fehlerbehebung

### Add-on startet nicht

1. **Prüfe die Logs** im Log-Tab des Add-ons
2. **Datenbank-Verbindung**:
   - Stelle sicher, dass PostgreSQL läuft
   - Prüfe die Verbindungsdetails (Host, Port, Passwort)
   - Teste die Verbindung mit einem PostgreSQL-Client

### PostgreSQL Hostname herausfinden

Wenn du das PostgreSQL Add-on nutzt, findest du den Hostnamen:

1. Gehe zum PostgreSQL Add-on
2. Schau in den **Info** Tab
3. Der Hostname ist meist: `a0d7b954-postgresql` oder ähnlich
4. Alternativ kannst du `postgres` als Hostname versuchen

### Port 3000 bereits belegt

Ändere in der Konfiguration:

```yaml
port: 3001
```

Dann erreichst du die App unter: `http://homeassistant.local:3001`

### Datenbank-Migrations-Fehler

Das Add-on führt automatisch Datenbank-Migrationen durch. Bei Problemen:

1. Prüfe die Logs
2. Stelle sicher, dass der Benutzer die nötigen Rechte hat
3. Eventuell Datenbank neu erstellen

## Nächste Schritte

Nach erfolgreicher Installation:

1. **Erste Kontakte anlegen** - Gehe zu "Contacts" und füge deine ersten Kontakte hinzu
2. **Familien erstellen** - Gruppiere Kontakte in Familien
3. **Erinnerungen einrichten** - Erstelle automatische Erinnerungen
4. **Events planen** - Plane deine ersten Veranstaltungen
5. **Invite-Gruppen** - Organisiere Gruppen für Einladungen

## Support

Bei Problemen oder Fragen:

- Prüfe die Logs im Add-on
- Erstelle ein Issue auf GitHub
- Prüfe die README.md für weitere Informationen

## Updates

Das Add-on kann über den Add-on Store aktualisiert werden:

1. Gehe zum Add-on
2. Wenn ein Update verfügbar ist, erscheint ein **Update** Button
3. Klicke auf Update und warte auf die Installation

**Wichtig**: Erstelle vor größeren Updates ein Backup deiner PostgreSQL-Datenbank!

## Backup

Sichere regelmäßig deine Daten:

1. **Home Assistant Snapshot** - Enthält die Add-on-Konfiguration
2. **PostgreSQL Backup** - Sichere die Datenbank separat:
   ```bash
   pg_dump -h POSTGRES_HOST -U reminderapp reminderapp > backup.sql
   ```

## Deinstallation

So entfernst du das Add-on:

1. Stoppe das Add-on
2. Klicke auf **Uninstall**
3. Optional: Lösche die PostgreSQL-Datenbank (Vorsicht, alle Daten gehen verloren!)
