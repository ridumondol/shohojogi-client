"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import {
  CalendarCheck2,
  CalendarPlus,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "@/app/ThemeProvider";
import { ToastContainer } from "@/components/ui/toast-system";

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  photoURL?: string;
  role?: string;
};

function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMobileOpen(false);
    setProfileOpen(false);
  }

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
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const isHomeActive = pathname === "/";
  const isEventsActive = pathname.startsWith("/events");
  const isDashboardActive = pathname.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 text-slate-900 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 dark:text-slate-100 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Shohojogi Home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-amber-300 shadow-sm transition-transform duration-200 group-hover:scale-105">
            <HeartHandshake size={23} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-teal-800 dark:text-teal-300">Shohojogi</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Serve Together</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1.5 lg:gap-2 md:flex" aria-label="Main navigation">
          <Link
            href="/"
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              isHomeActive
                ? "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-bold"
                : "text-slate-600 hover:text-teal-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-teal-300 dark:hover:bg-slate-900"
            }`}
          >
            Home
          </Link>
          <Link
            href="/events"
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              isEventsActive
                ? "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-bold"
                : "text-slate-600 hover:text-teal-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-teal-300 dark:hover:bg-slate-900"
            }`}
          >
            Upcoming Events
          </Link>
          <Link
            href="/#how-it-works"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-teal-300 dark:hover:bg-slate-900 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#gallery"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-teal-300 dark:hover:bg-slate-900 transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/#newsletter"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-teal-300 dark:hover:bg-slate-900 transition-colors"
          >
            Contact
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                isDashboardActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-bold"
                  : "text-slate-600 hover:text-teal-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-teal-300 dark:hover:bg-slate-900"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Action Items (Desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                title={user.name || user.email || "Your profile"}
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                className="group flex items-center gap-2.5 rounded-full border border-slate-200 p-1 pr-3 transition hover:border-teal-500/50 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-600 dark:border-slate-800 dark:hover:border-teal-500/50 dark:hover:bg-slate-900"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.name || "Profile"}
                    width={34}
                    height={34}
                    unoptimized
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-teal-700/20"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-800 font-bold text-white text-xs">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
                <span className="max-w-[120px] truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {user.name || "Account"}
                </span>
              </button>

              {/* Avatar Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Summary Header */}
                  <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                      {user.name || "Community Member"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>

                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300"
                    >
                      <User size={16} className="text-teal-600 dark:text-teal-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/create-event"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300"
                    >
                      <CalendarPlus size={16} className="text-teal-600 dark:text-teal-400" />
                      <span>Create Event</span>
                    </Link>
                    <Link
                      href="/my-events"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300"
                    >
                      <CalendarCheck2 size={16} className="text-teal-600 dark:text-teal-400" />
                      <span>Manage Events</span>
                    </Link>
                    <Link
                      href="/my-joined-events"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300"
                    >
                      <Users size={16} className="text-teal-600 dark:text-teal-400" />
                      <span>Joined Events</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300"
                    >
                      <LayoutDashboard size={16} className="text-teal-600 dark:text-teal-400" />
                      <span>Dashboard</span>
                    </Link>
                  </div>

                  <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        toggleTheme();
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300"
                    >
                      {theme === "dark" ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-slate-600" />}
                      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl border border-slate-200 p-2 text-slate-700 dark:border-slate-800 dark:text-slate-200"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 dark:border-slate-800 dark:text-slate-200"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden animate-in slide-in-from-top-2 duration-150">
          {user && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.name || "Profile"}
                  width={42}
                  height={42}
                  unoptimized
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-teal-700/20"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-800 font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {user.name || "Community Member"}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isHomeActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-bold"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              Home
            </Link>
            <Link
              href="/events"
              onClick={() => setMobileOpen(false)}
              className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isEventsActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-bold"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              Upcoming Events
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              How It Works
            </Link>
            <Link
              href="/#gallery"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Gallery
            </Link>
            <Link
              href="/#newsletter"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Contact
            </Link>

            {user ? (
              <>
                <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <User size={17} className="text-teal-600 dark:text-teal-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <LayoutDashboard size={17} className="text-teal-600 dark:text-teal-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/create-event"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <CalendarPlus size={17} className="text-teal-600 dark:text-teal-400" />
                  <span>Create Event</span>
                </Link>
                <Link
                  href="/my-events"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <CalendarCheck2 size={17} className="text-teal-600 dark:text-teal-400" />
                  <span>Manage Events</span>
                </Link>
                <Link
                  href="/my-joined-events"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <Users size={17} className="text-teal-600 dark:text-teal-400" />
                  <span>Joined Events</span>
                </Link>
                <button
                  onClick={logout}
                  className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut size={17} />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="mt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-xl bg-teal-800 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-teal-700"
                >
                  Log In
                </Link>
              </div>
            )}
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
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-amber-300">
              <HeartHandshake size={20} aria-hidden="true" />
            </span>
            <span className="text-xl font-black text-white">Shohojogi</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
            A trusted community-service platform for everyday changemakers across Bangladesh. Show up, take action, and serve together.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Quick Links</h3>
          <div className="mt-3 flex flex-col gap-2.5 text-sm">
            <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <Link href="/events" className="hover:text-amber-300 transition-colors">Upcoming Events</Link>
            <Link href="/#how-it-works" className="hover:text-amber-300 transition-colors">How It Works</Link>
            <Link href="/#gallery" className="hover:text-amber-300 transition-colors">Photo Gallery</Link>
            <Link href="/dashboard" className="hover:text-amber-300 transition-colors">Volunteer Dashboard</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Get Involved</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Organise a warmth event, plant trees in your neighbourhood, or join an emergency medical camp.
          </p>
          <div className="mt-4">
            <Link
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700"
            >
              Host a Community Event
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Connect With Us</h3>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Follow our initiatives and tag #Shohojogi to share your community stories.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
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
      <div className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-500">
        © 2026 Shohojogi. Built for community-first social development across Bangladesh.
      </div>
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
      <ToastContainer />
    </div>
  );
}
