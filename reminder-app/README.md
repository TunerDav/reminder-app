# Reminder App - Home Assistant Add-on

![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Supports armhf Architecture][armhf-shield]
![Supports armv7 Architecture][armv7-shield]
![Supports i386 Architecture][i386-shield]

## About

Family relationship manager with reminders, events and contacts for Home Assistant.

This add-on allows you to:

- Manage contacts and families
- Track relationships and relationship scores
- Create and manage reminders (birthdays, anniversaries, calls, visits)
- Organize events and event templates
- Set up invite groups for congregation activities
- View calendar with all upcoming events

## Installation

1. Add this repository to your Home Assistant add-on store
2. Click on "Reminder App" in the add-on store
3. Click "Install"
4. Configure the add-on (see configuration section below)
5. Start the add-on
6. Access the UI via the Web UI button or at `http://homeassistant.local:3000`

## Configuration

### Database Configuration

You need a PostgreSQL database to run this add-on. You can either:

#### Option 1: Use Home Assistant PostgreSQL Add-on

1. Install the PostgreSQL add-on from the official add-on store
2. Create a database called `reminderapp`
3. Configure this add-on with the PostgreSQL connection details

#### Option 2: Use External PostgreSQL

Configure an external PostgreSQL server with the connection details.

### Add-on Options

```yaml
postgres_host: postgres
postgres_port: 5432
postgres_db: reminderapp
postgres_user: reminderapp
postgres_password: changeme
node_env: production
port: 3000
```

#### Option: `postgres_host`

The hostname or IP address of your PostgreSQL server.

#### Option: `postgres_port`

The port of your PostgreSQL server (default: 5432).

#### Option: `postgres_db`

The name of the database to use.

#### Option: `postgres_user`

The PostgreSQL user to connect with.

#### Option: `postgres_password`

The password for the PostgreSQL user.

#### Option: `node_env`

The Node.js environment (production or development).

#### Option: `port`

The port the web interface will be available on (default: 3000).

## Usage

After starting the add-on, the web interface will be available at:

- From Home Assistant: Click "Open Web UI" in the add-on page
- From your network: `http://homeassistant.local:3000`

## Features

- **Contact Management**: Store and organize all your congregation contacts
- **Family Tracking**: Group contacts into families
- **Relationship Scores**: Track and visualize relationship strength over time
- **Smart Reminders**: Automatic birthday and anniversary reminders
- **Event Planning**: Create and manage congregation events
- **Event Templates**: Reusable templates for recurring events
- **Invite Groups**: Organize people into groups for easy event invitations
- **Calendar View**: Visual overview of all upcoming activities
- **Tags & Categories**: Flexible organization with custom tags

## Support

For issues and feature requests, please use the GitHub repository.

## License

MIT License

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg
