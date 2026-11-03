"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, RefreshCw, PlusCircle } from "lucide-react";

interface EventRecord {
  _id: string;
  title: string;
  category?: string;
  location?: string;
  date?: string;
  image?: string;
  description?: string;
}

function CategoryBadge({ category }: { category?: string }) {
  const styles: Record<string, string> = {
    Cleanup: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    Donation: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    Plantation: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    "Blood Donation": "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    "Food Drive": "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  };
  const cls = styles[category ?? ""] ?? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${cls}`}>
      {category ?? "Community Event"}
    </span>
  );
}

function EventCard({ event }: { event: EventRecord }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-video overflow-hidden">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            unoptimized
            className="object-cover transition duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
        )}
        <span className="absolute left-3 top-3">
          <CategoryBadge category={event.category} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
          {event.title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          {event.location && (
            <p className="flex items-center gap-1.5">
              <MapPin size={13} aria-hidden="true" />
              {event.location}
            </p>
          )}
          {event.date && (
            <p className="flex items-center gap-1.5">
              <CalendarDays size={13} aria-hidden="true" />
              {new Date(event.date).toLocaleDateString("en-BD", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="mt-auto pt-5">
          <Link
            href={`/events/${event._id}`}
            className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-400"
          >
            View Event
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/events/featured", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load events.");
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await fetchEvents();
    })();
    return () => { cancelled = true; };
  }, [fetchEvents]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Upcoming Events Near You
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Discover social development drives across Dhaka, Sylhet, and Chattogram.
            </p>
          </div>
          <Link
            href="/events"
            className="flex shrink-0 items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
          >
            View All Events <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-lg font-semibold text-red-700 dark:text-red-400">
              Could not load events
            </p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw size={15} aria-hidden="true" /> Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              No upcoming events yet
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Be the first to organise a community drive in your area.
            </p>
            <Link
              href="/create-event"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 font-bold text-white transition hover:bg-teal-800"
            >
              <PlusCircle size={16} aria-hidden="true" /> Create an Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
