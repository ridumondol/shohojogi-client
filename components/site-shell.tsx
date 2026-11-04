"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState, type ReactNode } from "react";
import { HeartHandshake, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/app/ThemeProvider";

type StoredUser = {
  name?: string;
  email?: string;
  photoURL?: string;
};

function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const readUser = () => {
      try {
        const token = localStorage.getItem("token");
        const value = localStorage.getItem("user");
        setUser(token && value ? (JSON.parse(value) as StoredUser) : null);
      } catch {
        setUser(null);
      }
    };
    readUser();
    window.addEventListener("storage", readUser);
    window.addEventListener("shohojogi-auth-change", readUser);
    return () => {
      window.removeEventListener("storage", readUser);
      window.removeEventListener("shohojogi-auth-change", readUser);
    };
  }, [pathname]);

  async function logout() {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } catch {
      // ignore network errors during logout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("shohojogi-auth-change"));
    setUser(null);
    setProfileOpen(false);
    setMobileOpen(false);
    router.push("/login");
  }

  const navLinks = [
    { href: "/events", label: "Upcoming Events" },
    { href: "/dashboard", label: "Dashboard", protected: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Shohojogi home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-amber-300">
            <HeartHandshake size={23} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight text-teal-800 dark:text-teal-300">Shohojogi</span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Serve Together</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navLinks.filter((link) => !link.protected || user).map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-600 transition hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="relative flex items-center gap-3">
              <button type="button" title={user.name || user.email || "Your profile"} onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-teal-600">
                {user.photoURL ? <Image src={user.photoURL} alt={user.name || "Profile"} width={36} height={36} unoptimized className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">{user.name?.charAt(0).toUpperCase() || "U"}</span>}
                <span className="max-w-28 truncate text-sm font-semibold">{user.name || "Account"}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <Link href="/create-event" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Create Event</Link>
                  <Link href="/my-events" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Manage Events</Link>
                  <Link href="/my-joined-events" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Joined Events</Link>
                  <Link href="/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Profile</Link>
                  <button type="button" onClick={logout} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">Login</Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <Link href="/events" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Upcoming Events</Link>
            {user ? <>
              <Link href="/create-event" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Create Event</Link>
              <Link href="/my-events" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Manage Events</Link>
              <Link href="/my-joined-events" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Joined Events</Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Profile</Link>
              <button onClick={logout} className="rounded-lg px-3 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">Logout</button>
            </> : <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm font-bold text-teal-800 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40">Login</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/shohojogi",
    ariaLabel: "Follow us on Facebook",
    Icon: FacebookIcon,
  },
  {
    name: "X",
    href: "https://x.com/shohojogi",
    ariaLabel: "Follow us on X",
    Icon: XIcon,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/shohojogi",
    ariaLabel: "Follow us on Instagram",
    Icon: InstagramIcon,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/shohojogi",
    ariaLabel: "Follow us on LinkedIn",
    Icon: LinkedInIcon,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@shohojogi",
    ariaLabel: "Follow us on YouTube",
    Icon: YouTubeIcon,
  },
  {
    name: "GitHub",
    href: "https://github.com/shohojogi",
    ariaLabel: "Follow us on GitHub",
    Icon: GitHubIcon,
  },
];

function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <h2 className="text-lg font-extrabold text-white">Shohojogi</h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">A community platform for people who want to make local social change happen together.</p>
        </div>
        <div>
          <h3 className="font-bold text-white">Explore</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm"><Link href="/events" className="hover:text-amber-300">Upcoming Events</Link><Link href="/create-event" className="hover:text-amber-300">Create an Event</Link><Link href="/profile" className="hover:text-amber-300">My Profile</Link></div>
        </div>
        <div>
          <h3 className="font-bold text-white">Get Involved</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">Organize a local drive, invite neighbours, and help build a stronger community.</p>
          <p className="mt-2 text-sm text-slate-400">For event-specific questions, contact the event organizer.</p>
        </div>
        <div>
          <h3 className="font-bold text-white">Follow Shohojogi</h3>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.ariaLabel}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 transition hover:border-amber-400 hover:bg-slate-800 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <item.Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">© {2026} Shohojogi. Show up. Serve together.</div>
    </footer>
  );
}

function SiteHeaderFallback() {
  return (
    <header
      aria-hidden="true"
      className="sticky top-0 z-40 h-[65px] shrink-0 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
    />
  );
}

function SiteFooterFallback() {
  return (
    <footer
      aria-hidden="true"
      className="mt-auto min-h-[290px] border-t border-slate-800 bg-slate-950"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-5 w-28 rounded bg-slate-800" />
            <div className="h-3 w-full max-w-48 rounded bg-slate-800" />
            <div className="h-3 w-5/6 max-w-44 rounded bg-slate-800" />
            <div className="h-3 w-2/3 max-w-36 rounded bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="h-10 border-t border-slate-800" />
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      {children}
      <Suspense fallback={<SiteFooterFallback />}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}
