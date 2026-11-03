# Shohojogi (সহযোগী) — Community Social Development Events Platform

**Tagline:** Show up. Serve together.

**Live Site:** <ADD LIVE URL HERE>

Shohojogi connects volunteers and organisers across Bangladesh for local community-service events — from winter warmth drives in Mirpur to river cleanups in Chattogram.

## Key Features

- **Native Home Page** — Hero banner with impact stats, feature cards, a live upcoming-events grid (up to 6), a community gallery, and a newsletter sign-up section.
- **Discover Events** — Browse all upcoming community-service events with search, category, and location filters.
- **Create & Manage Events** — Registered organisers can create events (future dates only), edit details, and delete their own events.
- **Join in 1-Click** — Authenticated users can RSVP to any upcoming event and cancel participation at any time.
- **Personal Dashboard** — View your created events, joined events, and volunteering history in one place.
- **Light / Dark Theme** — Theme preference is stored in `localStorage` and respects the OS colour-scheme preference on first load.
- **Responsive Design** — Fully responsive at 375 px, 768 px, and 1440 px in both light and dark modes.

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 16.4.3 (App Router, Cache Components)   |
| UI         | React 19, Tailwind CSS v4, Lucide React         |
| Backend    | Express.js                                      |
| Database   | MongoDB (native driver)                         |
| Auth       | Custom JWT (sign-in / register routes)          |

## Local Development

### Prerequisites

- Node.js 18+
- A running MongoDB instance
- The `ShebaConnect-Server` Express API running on port 8000

### Client setup

```bash
cd ShebaConnect
cp .env.example .env.local       # then fill in API_SERVER_URL
npm ci
npm run dev
```

Open <http://localhost:3000>.

### Server setup

```bash
cd ShebaConnect-Server
cp .env.example .env              # fill in MONGODB_URL, JWT_SECRET, CLIENT_URL
npm ci
node index.js
```

## Environment Variables

### Client (`ShebaConnect/.env.local`)

| Variable         | Description                                      |
|------------------|--------------------------------------------------|
| `API_SERVER_URL` | Origin of the Express API (e.g. `http://localhost:8000`). Next.js rewrites `/api/*` requests to this server. |

### Server (`ShebaConnect-Server/.env`)

| Variable      | Description                                         |
|---------------|-----------------------------------------------------|
| `MONGODB_URL` | MongoDB connection string                           |
| `JWT_SECRET`  | Secret key used to sign and verify JWT tokens       |
| `CLIENT_URL`  | Allowed CORS origin (comma-separated for multiple)  |
| `PORT`        | Server port (default `8000`)                        |

> **Note:** Never commit `.env.local` or `.env` to version control.

## Deployment

1. Set `API_SERVER_URL` in the client deployment environment to the deployed Express API origin.
2. Set `CLIENT_URL` (or `CLIENT_URLS`) on the server to the deployed client origin.
3. Replace `<ADD LIVE URL HERE>` above with the production URL.
