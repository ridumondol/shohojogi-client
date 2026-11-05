# Shohojogi (সহযোগী) — Community Social Development Events Platform

**Tagline:** Show up. Serve together.

**Live URL:** [https://shohojogi-community.vercel.app](https://shohojogi-community.vercel.app) *(or your deployed production domain)*

Shohojogi is a modern, community-first social development platform connecting passionate volunteers, organizers, and local youth clubs across Bangladesh. From winter clothes distributions in Mirpur and river cleanups along Buriganga to emergency blood drives in Chittagong, Shohojogi makes organizing and attending community-service events seamless and impactful.

---

## 🌟 Key Features

1. **Native Dynamic Home Page**:
   - **Hero Banner** with key community impact metrics and quick calls-to-action.
   - **How It Works** section detailing the 4-step volunteer and organizer cycle.
   - **Upcoming Events Grid** presenting exactly 6 upcoming events sorted by date dynamically fetched from MongoDB.
   - **Community Action Gallery** featuring real volunteering moments.
   - **Newsletter Sign-up** UI for community event announcements.

2. **Event Discovery with Rich Filtering**:
   - Search events by title, description, or city/area.
   - Filter by categories (*Cleanup, Plantation, Donation, Healthcare, Education, Blood Donation, Relief, Food, Community Support*).
   - 1-click RSVP / cancellation with responsive loading feedback and toast notifications.

3. **Rich Joined Events Hub**:
   - Private, date-sorted dashboard for all events you have committed to attend.
   - **Status Badges**: *Upcoming*, *Today*, and *Completed*.
   - **Add to Calendar**: Instant Google Calendar link generation or `.ics` iCal file download.
   - **Get Directions**: 1-click navigation opening the exact venue in Google Maps.
   - **Share Event**: Native Web Share API with clipboard copy fallback.
   - **Leave Participation**: Modal confirmation dialog preventing accidental cancellations.

4. **Comprehensive Volunteer Profile (View + Full Update)**:
   - View your role (*Active Volunteer* or *Administrator*), member since date, and direct impact metrics (events created, events joined, completed events).
   - Full live editing of name, phone number, bio, city/area, and profile photo URL with live avatar preview.
   - Instant reflection in the navigation header without requiring manual page reloads (via custom event dispatch).

5. **Organizer Portal & Event Management**:
   - Create community events with strict validation rejecting past dates.
   - Live image URL preview, location tags, and category selection.
   - Update event schedules or delete created events with confirmation protection.

6. **Authentication & Multi-Provider Social Login**:
   - Secure email and password authentication with client & server validation.
   - Google OAuth 2.0 & GitHub OAuth 2.0 social login support.
   - JWT tokens stored in `localStorage` and HttpOnly cookies, ensuring state persistence across page reloads.

7. **Universal Light & Dark Theme**:
   - Theme toggle seamlessly integrated in the navbar and mobile drawer.
   - Zero-flash initial load script respecting OS `prefers-color-scheme` or stored preference.
   - Responsive at mobile (375px), tablet (768px), and desktop (1440px).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16.4.3 (App Router, Partial Prefetching, Cache Components) |
| **UI & Styling** | React 19, Tailwind CSS v4, Lucide React Icons |
| **Backend API** | Node.js (ESM), Express.js 5 |
| **Database** | MongoDB (native driver with indexed collections) |
| **Security & Auth** | Custom JWT (`jsonwebtoken`), `bcryptjs`, Rate Limiting middleware |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A running MongoDB instance (local or MongoDB Atlas)

### 1. Database Seeding (Exactly 12 Verified Events)

From the `ShebaConnect-Server` directory, run the idempotent seed script:

```bash
cd ShebaConnect-Server
npm run seed
```

This populates MongoDB with 12 complete, future-dated events across Dhaka, Chittagong, Sylhet, Cox's Bazar, Rajshahi, Khulna, and Comilla with verified Unsplash images, dates, categories, and descriptions. Running it multiple times is idempotent and will not create duplicates.

### 2. Start the Backend API

```bash
cd ShebaConnect-Server
cp .env.example .env
# Fill in your MONGODB_URL and JWT_SECRET
npm install
npm run dev
```

The Express API starts at `http://localhost:8000`.

### 3. Start the Next.js Client

```bash
cd ShebaConnect
cp .env.example .env.local
# Verify API_SERVER_URL=http://localhost:8000
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔐 Environment Variables

### Client (`ShebaConnect/.env.local`)
| Variable | Description | Default |
|---|---|---|
| `API_SERVER_URL` | Express backend origin URL | `http://localhost:8000` |

### Server (`ShebaConnect-Server/.env`)
| Variable | Description |
|---|---|
| `MONGODB_URL` | MongoDB connection URI (`mongodb+srv://...` or `mongodb://127.0.0.1:27017`) |
| `MONGODB_DB_NAME` | Database name (defaults to `shohojogi`) |
| `JWT_SECRET` | 32+ character random secret for JWT signing |
| `CLIENT_URL` | Allowed frontend origin for CORS (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Optional: Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Optional: Google OAuth Client Secret |
| `GITHUB_CLIENT_ID` | Optional: GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | Optional: GitHub OAuth Client Secret |

---

## 🧪 Testing & Verification

```bash
# Run server test suite (18 unit and integration tests)
cd ShebaConnect-Server
npm test

# Run client typecheck & build
cd ShebaConnect
npm run typecheck
npm run build
```
