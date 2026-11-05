"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  Compass,
  Filter,
  MapPin,
  PlusCircle,
  Search,
  Users,
  X,
} from "lucide-react";
import { showToast } from "@/components/ui/toast-system";
import { formatEventDate } from "@/lib/event-date";

interface EventRecord {
  _id: string;
  title: string;
  category?: string;
  eventType?: string;
  location?: string;
  date?: string;
  eventDate?: string;
  image?: string;
  thumbnail?: string;
  description?: string;
  attendeesCount?: number;
  time?: string;
}

function CategoryBadge({ category }: { category?: string }) {
  const styles: Record<string, string> = {
    Cleanup: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    Donation: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    Plantation: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    "Blood Donation": "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    "Food Drive": "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    Food: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    Healthcare: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
    Education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    Relief: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    "Community Support": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  };
  const cls = styles[category ?? ""] ?? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${cls}`}>
      {category ?? "Community Event"}
    </span>
  );
}

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasCreated = searchParams.get("created") === "1";

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("");

  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/events");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load events.");
        }

        let nextJoinedIds: string[] = [];
        if (token) {
          const joinedResponse = await fetch("/api/events/my-joined-events", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const joinedData = await joinedResponse.json();

          if (joinedResponse.ok) {
            nextJoinedIds = (joinedData.events || []).map((ev: EventRecord) => ev._id);
          } else if (joinedResponse.status === 401 || joinedResponse.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }

        if (cancelled) return;
        setEvents(data.events || []);
        setJoinedIds(nextJoinedIds);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  useEffect(() => {
    if (wasCreated) {
      showToast.success("Your event was published successfully and is now live!");
    }
  }, [wasCreated]);

  async function handleJoinToggle(eventId: string) {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push(`/login?returnTo=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }

    setActionId(eventId);

    try {
      const isJoined = joinedIds.includes(eventId);
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: isJoined ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        throw new Error(data.message || "Action failed.");
      }

      if (isJoined) {
        setJoinedIds((prev) => prev.filter((id) => id !== eventId));
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === eventId
              ? { ...ev, attendeesCount: Math.max(0, (ev.attendeesCount || 1) - 1) }
              : ev
          )
        );
        showToast.info("You have left the event.");
      } else {
        setJoinedIds((prev) => [...prev, eventId]);
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === eventId
              ? { ...ev, attendeesCount: (ev.attendeesCount || 0) + 1 }
              : ev
          )
        );
        showToast.success("You have successfully joined the event!");
      }
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setActionId("");
    }
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => {
      const c = ev.category || ev.eventType;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const locLower = selectedLocation.trim().toLowerCase();

    return events.filter((ev) => {
      const titleMatch = ev.title.toLowerCase().includes(searchLower);
      const descMatch = (ev.description || "").toLowerCase().includes(searchLower);
      const locMatch = (ev.location || "").toLowerCase().includes(searchLower);
      const category = ev.category || ev.eventType;

      const matchesSearch = !searchLower || titleMatch || descMatch || locMatch;
      const matchesCategory = selectedCategory === "All" || category === selectedCategory;
      const matchesLoc = !locLower || (ev.location || "").toLowerCase().includes(locLower);

      return matchesSearch && matchesCategory && matchesLoc;
    });
  }, [events, search, selectedCategory, selectedLocation]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSelectedLocation("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <Compass size={14} />
                Explore Social Events
              </span>
              <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                Upcoming Community Events
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Discover volunteer events happening across Dhaka, Chattogram, Sylhet, and other cities in Bangladesh.
              </p>
            </div>

            <Link
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] shrink-0"
            >
              <PlusCircle size={18} />
              Host an Event
            </Link>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event name, keywords..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 rounded text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Filter size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
            </div>

            {/* Location Filter Input */}
            <div className="relative">
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Filter by city/area (e.g. Mirpur)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
            </div>

            {/* Reset / Clear Button */}
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Clear All Filters
            </button>
          </div>
        </section>

        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center justify-between">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setReloadCount((count) => count + 1)}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="aspect-video w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2.5 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-6 flex gap-2">
                  <div className="h-9 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-9 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <Calendar size={32} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              No Upcoming Events Scheduled
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Be the first to organize a local event in your area!
            </p>
            <Link
              href="/create-event"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
            >
              <PlusCircle size={17} />
              Host First Event
            </Link>
          </div>
        )}

        {!loading && events.length > 0 && filteredEvents.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">
              No events matched your current search filters.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try searching with a broader keyword or resetting filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Uniform Cards Grid */}
        {!loading && filteredEvents.length > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <p>Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> upcoming events</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const isJoined = joinedIds.includes(event._id);
                const imageUrl = event.image || event.thumbnail;
                const category = event.category || event.eventType || "Volunteer";
                const dateVal = event.date || event.eventDate;

                return (
                  <article
                    key={event._id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-teal-600/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500/40"
                  >
                    {/* Uniform Image Banner */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={event.title}
                          fill
                          unoptimized
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Calendar size={36} />
                        </div>
                      )}

                      <span className="absolute left-3 top-3">
                        <CategoryBadge category={category} />
                      </span>

                      {isJoined && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow backdrop-blur">
                          ✓ Joined
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
                        {event.title}
                      </h2>

                      <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        {dateVal && (
                          <p className="flex items-center gap-2">
                            <CalendarDays size={14} className="shrink-0 text-teal-600 dark:text-teal-400" />
                            <span>
                              {formatEventDate(dateVal, "EEE, MMM d, yyyy")}
                            </span>
                          </p>
                        )}

                        {event.location && (
                          <p className="flex items-center gap-2">
                            <MapPin size={14} className="shrink-0 text-teal-600 dark:text-teal-400" />
                            <span className="truncate">{event.location}</span>
                          </p>
                        )}

                        <p className="flex items-center gap-2">
                          <Users size={14} className="shrink-0 text-teal-600 dark:text-teal-400" />
                          <span>{event.attendeesCount ?? 0} volunteers registered</span>
                        </p>
                      </div>

                      {event.description && (
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {event.description}
                        </p>
                      )}

                      {/* Card Action Buttons (Uniform Layout) */}
                      <div className="mt-auto pt-6 flex items-center gap-3">
                        <Link
                          href={`/events/${event._id}`}
                          className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          View Event
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleJoinToggle(event._id)}
                          disabled={actionId === event._id}
                          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition active:scale-[0.98] disabled:opacity-50 ${
                            isJoined
                              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                              : "bg-teal-800 text-white shadow-sm hover:bg-teal-700"
                          }`}
                        >
                          {actionId === event._id
                            ? "Please wait..."
                            : isJoined
                            ? "Cancel"
                            : "Join Event"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 text-center text-slate-500">
          Loading events...
        </main>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
