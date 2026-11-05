"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  Compass,
  Heart,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { showToast } from "@/components/ui/toast-system";

function subscribeToAuthChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("shohojogi-auth-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("shohojogi-auth-change", callback);
  };
}

function getUserNameSnapshot() {
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored) as { name?: string };
      return user.name || "Volunteer";
    }
  } catch {
    // Keep the existing empty-name fallback for invalid stored data.
  }
  return "";
}

interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  totalParticipants: number;
  upcomingEvents: number;
  eventsCreated: number;
  eventsJoined: number;
  completedEvents: number;
  myTotalParticipants: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalUsers: 0,
    totalParticipants: 0,
    upcomingEvents: 0,
    eventsCreated: 0,
    eventsJoined: 0,
    completedEvents: 0,
    myTotalParticipants: 0,
  });

  const [loading, setLoading] = useState(true);
  const userName = useSyncExternalStore(subscribeToAuthChanges, getUserNameSnapshot, () => "");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?returnTo=/dashboard");
      return;
    }

    async function fetchDashboardStats() {
      try {
        const response = await fetch("/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login?returnTo=/dashboard");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard metrics.");
        }

        setStats(data.stats);
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : "Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("shohojogi-auth-change"));
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome Header Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <LayoutDashboard size={14} />
                Volunteer Hub
              </span>
              <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                Welcome back{userName ? `, ${userName}` : ""}!
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Track your social impact, upcoming events, and community activities across Bangladesh.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/create-event"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
              >
                <CalendarPlus size={16} />
                Host an Event
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Quick Action Navigation Grid */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/events"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-500/50 hover:shadow dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="rounded-xl bg-teal-100 p-2.5 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Explore Events</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Find active events</p>
            </div>
          </Link>

          <Link
            href="/my-joined-events"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-500/50 hover:shadow dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <HeartHandshake size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Joined Events</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">View participation</p>
            </div>
          </Link>

          <Link
            href="/my-events"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-500/50 hover:shadow dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CalendarCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Manage Events</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Your created events</p>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-500/50 hover:shadow dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">My Profile</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Account & bio</p>
            </div>
          </Link>
        </section>

        {/* Personal Impact Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Your Direct Social Contribution
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                My Community Impact 🌍
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Events Organized</span>
              <p className="mt-2 text-3xl font-black text-teal-800 dark:text-teal-300">{stats.eventsCreated}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Events you initiated</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Events Joined</span>
              <p className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">{stats.eventsJoined}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Events you participated in</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Completed Events</span>
              <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.completedEvents}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Past attended initiatives</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Total Participants</span>
              <p className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.myTotalParticipants}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">People joining your events</p>
            </div>
          </div>
        </section>

        {/* Platform Overview Statistics */}
        <section className="space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Collective Movement
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Platform-Wide Activity
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">All Events</span>
                <CalendarDays size={18} className="text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.totalEvents}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total events hosted</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Registered Volunteers</span>
                <Users size={18} className="text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active citizens across BD</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Total RSVPs</span>
                <Heart size={18} className="text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.totalParticipants}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Volunteer attendances</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Upcoming Now</span>
                <TrendingUp size={18} className="text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-teal-800 dark:text-teal-300">{stats.upcomingEvents}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Scheduled future events</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
