# 🤝 সহযোগী (Shohojogi) - Client Side Repository

**Shohojogi (সহযোগী)** is a community-driven, single-page web application designed to connect local volunteers with social service and community development events. From organizing winter clothes distribution to local tree plantations, Shohojogi provides an intuitive platform to create, manage, discover, and join impactful social initiatives in your community.

---

## 🔗 Quick Links

* **Live Application:** [https://shohojogi-delta.vercel.app/](https://shohojogi-delta.vercel.app/)
* **Client Repository:** [https://github.com/ridumondol/shohojogi-client](https://github.com/ridumondol/shohojogi-client)
* **Server Repository:** [https://github.com/ridumondol/shohojogi-server](https://github.com/ridumondol/shohojogi-server)

---

## ✨ Key Features

* **🔐 Authentication & Role-Based Access:** Complete Email/Password and Social (Google/GitHub) authentication. Protected routes ensure that non-authenticated users cannot access event creation, management, or participation pages without losing their state on reload.
* **📅 Dynamic Event Management:** Logged-in users can easily post upcoming social events with comprehensive details (Title, Description, Event Type, Image URL, Location, and Future Date). Includes strict form validation to prevent posting past-dated events.
* **🎯 Event Discovery & One-Click Participation:** Browse filterable upcoming social events in a responsive card layout. Anyone can view detailed event info, while authenticated users can join events with a single click.
* **⚙️ Personalized User Dashboard:**
  * **Manage Events:** A dedicated space where creators can view, edit, or delete events they posted.
  * **Joined Events:** Allows volunteers to view and track all social events they have registered to participate in, sorted by event date.
* **🌓 Theme Customization & UI Excellence:** Features a fully functional Light/Dark mode switcher across the entire web application, interactive toast notifications (SweetAlert2/Toast), responsive image grids, and loading skeletons for an enhanced UX.

---

## 🛠️ Tech Stack (Frontend)

* **Framework:** Next.js (App Router) / React.js
* **Styling:** Tailwind CSS, DaisyUI / ShadCN UI / Hero UI
* **State & Authentication:** Context API / BetterAuth / Firebase Auth with JWT
* **Icons & Components:** Lucide Icons, React Hot Toast / SweetAlert2
* **Deployment:** Vercel

---

## 🚀 Getting Started Locally

Follow these steps to set up and run the frontend application on your local machine:

### Prerequisites

* **Node.js** (v18.0.0 or higher)
* **npm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ridumondol/shohojogi-client.git
   cd shohojogi-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   # Add your Firebase/BetterAuth configurations here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Open [http://localhost:3000](http://localhost:3000) to view the project live in your browser.

---

## 📁 Folder Structure Overview

```text
shohojogi-client/
├── app/                  # Next.js App Router pages & routes
│   ├── (auth)/           # Login & Register pages
│   ├── create-event/     # Private route for adding events
│   ├── manage-events/    # Private route for editing/deleting user events
│   ├── joined-events/    # Private route for joined events
│   ├── upcoming-events/  # Public route displaying active upcoming events
│   └── page.js           # Home page with banner, features, gallery & newsletter
├── components/           # Reusable UI components (Navbar, Footer, EventCard, etc.)
├── context/              # Authentication and Theme Context providers
└── public/               # Static assets and images
```

---

## 📜 License

This project is open-source and built for social development and educational purposes under the [MIT License](LICENSE).
