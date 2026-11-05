"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  CalendarPlus,
  Clock,
  Compass,
  Filter,
  HeartHandshake,
  MapPin,
  Navigation,
  Search,
  Share2,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { showToast } from "@/components/ui/toast-system";
import { formatEventDate } from "@/lib/event-date";
import { useToday } from "@/hooks/use-today";

interface JoinedEventRecord {
  _id: string;
  title: string;
  category?: string;
  eventType?: string;
  location?: string;
  date?: string;
  eventDate?: string;
  time?: string;
  image?: string;
  thumbnail?: string;
  description?: string;
  organizer?: string;
  organizerEmail?: string;
}

export default function MyJoinedEventsPage() {
  const router = useRouter();
  const today = useToday();

  const [events, setEvents] = useState<JoinedEventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");

  // Modal State for Leaving Event
  const [leavingEvent, setLeavingEvent] = useState<JoinedEventRecord | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    async function fetchJoinedEvents() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login?returnTo=/my-joined-events");
          return;
        }

        const response = await fetch("/api/events/my-joined-events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login?returnTo=/my-joined-events");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load joined events");
        }

        // Sort by event date ascending
        const sorted = (data.events || []).sort((a: JoinedEventRecord, b: JoinedEventRecord) => {
          const dateA = a.date || a.eventDate || "";
          const dateB = b.date || b.eventDate || "";
          return dateA.localeCompare(dateB);
        });

        setEvents(sorted);
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : "Something went wrong loading your joined events.");
      } finally {
        setLoading(false);
      }
    }

    fetchJoinedEvents();
  }, [router]);

  function getEventStatus(dateStr: string | undefined, currentDate: string): "Upcoming" | "Today" | "Completed" {
    if (!dateStr) return "Upcoming";
    const eventDay = dateStr.slice(0, 10);
    if (eventDay === currentDate) return "Today";
    if (eventDay > currentDate) return "Upcoming";
    return "Completed";
  }

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => {
      const cat = ev.category || ev.eventType;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [events]);

  // Next upcoming event for summary banner
  const nextUpcomingEvent = useMemo(() => {
    if (!today) return undefined;
    return events.find((ev) => {
      const d = (ev.date || ev.eventDate || "").slice(0, 10);
      return d >= today;
    });
  }, [events, today]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((ev) => {
      const title = ev.title.toLowerCase();
      const desc = (ev.description || "").toLowerCase();
      const loc = (ev.location || "").toLowerCase();
      const category = ev.category || ev.eventType || "Community";
      const dateVal = (ev.date || ev.eventDate || "").slice(0, 10);

      // Tab matching
      if (today && activeTab === "upcoming" && dateVal < today) return false;
      if (today && activeTab === "past" && dateVal >= today) return false;

      // Category matching
      if (selectedCategory !== "All" && category !== selectedCategory) return false;

      // Search matching
      if (query && !title.includes(query) && !desc.includes(query) && !loc.includes(query)) {
        return false;
      }

      return true;
    });
  }, [events, search, selectedCategory, activeTab, today]);

  async function handleConfirmLeave() {
    if (!leavingEvent) return;
    setIsLeaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`/api/events/${leavingEvent._id}/join`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to leave event.");
      }

      setEvents((prev) => prev.filter((ev) => ev._id !== leavingEvent._id));
      showToast.info(`You have cancelled participation for "${leavingEvent.title}".`);
      setLeavingEvent(null);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Failed to cancel participation.");
    } finally {
      setIsLeaving(false);
    }
  }

  async function handleShare(event: JoinedEventRecord) {
    const shareData = {
      title: event.title,
      text: `Join me at "${event.title}" on Shohojogi!`,
      url: `${window.location.origin}/events/${event._id}`,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // cancelled by user
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${window.location.origin}/events/${event._id}`);
      showToast.success("Event link copied to clipboard!");
    }
  }

  function downloadIcsFile(event: JoinedEventRecord) {
    const rawDate = event.date || event.eventDate;
    if (!rawDate) return;
    const dateStr = rawDate.slice(0, 10).replace(/-/g, "");
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Shohojogi//Community Events//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${(event.description || "").replace(/\n/g, " ").replace(/,/g, "\\,")}`,
      `LOCATION:${(event.location || "").replace(/,/g, "\\,")}`,
      `DTSTART:${dateStr}T090000Z`,
      `DTEND:${dateStr}T130000Z`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast.success("Calendar invite (.ics) downloaded!");
  }

  function getGoogleCalendarUrl(event: JoinedEventRecord) {
    const rawDate = event.date || event.eventDate;
    if (!rawDate) return "";
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.description || ""}\n\nOrganized via Shohojogi Community Platform`);
    const location = encodeURIComponent(event.location || "Bangladesh");
    const dateStr = rawDate.slice(0, 10).replace(/-/g, "");
    const dates = `${dateStr}T090000Z/${dateStr}T130000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header & Summary Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <UserCheck size={14} />
                My Commitments
              </span>
              <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                Joined Community Events
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Track your upcoming volunteer events, get directions, sync your calendar, or manage your participation.
              </p>
            </div>

            {/* Quick Summary Pill Box */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-center dark:border-slate-800 dark:bg-slate-950">
                <span className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Total Joined</span>
                <span className="block text-2xl font-black text-teal-800 dark:text-teal-300">{events.length}</span>
              </div>

              {today === null && (
                <div
                  aria-label="Loading date summary"
                  className="h-[68px] w-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                />
              )}

              {nextUpcomingEvent && (
                <div className="max-w-xs rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 text-left dark:border-teal-900/60 dark:bg-teal-950/40">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-teal-800 dark:text-teal-300">
                    <Sparkles size={12} />
                    Next Upcoming
                  </span>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-900 dark:text-white">
                    {nextUpcomingEvent.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {nextUpcomingEvent.date || nextUpcomingEvent.eventDate
                      ? formatEventDate(nextUpcomingEvent.date || nextUpcomingEvent.eventDate, "MMM d, yyyy")
                      : "Date coming soon"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Controls: Search, Category Filter & Tabs */}
        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs: Upcoming / Past / All */}
          <div className="flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              disabled={!today}
              onClick={() => setActiveTab("upcoming")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "upcoming"
                  ? "bg-teal-800 text-white shadow"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Upcoming Events
            </button>
            <button
              type="button"
              disabled={!today}
              onClick={() => setActiveTab("past")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "past"
                  ? "bg-teal-800 text-white shadow"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Past Completed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "all"
                  ? "bg-teal-800 text-white shadow"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              All Events ({events.length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your joined events..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 rounded p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative min-w-[160px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
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
          </div>
        </section>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
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

        {/* Empty States */}
        {!loading && events.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <HeartHandshake size={32} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              No Joined Events Yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              You haven&apos;t joined any community events yet. Discover tree plantations, blanket distributions, and free medical camps happening near you!
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
            >
              <Compass size={17} />
              Explore Upcoming Events
            </Link>
          </div>
        )}

        {!loading && events.length > 0 && filteredEvents.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">
              No events matched your current filters.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search query or switching tabs.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setActiveTab("all");
              }}
              className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Joined Events Cards Grid */}
        {!loading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const dateVal = event.date || event.eventDate;
              const status = today ? getEventStatus(dateVal, today) : null;
              const imageUrl = event.image || event.thumbnail;
              const category = event.category || event.eventType || "Volunteer";

              return (
                <div
                  key={event._id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Card Image & Badges */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={event.title}
                        fill
                        unoptimized
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Calendar size={36} />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                        {category}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold backdrop-blur shadow-sm ${
                          status === "Upcoming"
                            ? "bg-emerald-600 text-white"
                            : status === "Today"
                            ? "bg-amber-500 text-slate-950"
                            : status === "Completed"
                            ? "bg-slate-700 text-slate-200"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {status === "Upcoming" && "● Upcoming"}
                        {status === "Today" && "★ Happening Today"}
                        {status === "Completed" && "✓ Completed"}
                        {!status && "Checking date"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
                      {event.title}
                    </h2>

                    <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      {dateVal && (
                        <p className="flex items-center gap-2">
                          <CalendarDays size={14} className="shrink-0 text-teal-600 dark:text-teal-400" />
                          <span>
                            {formatEventDate(dateVal, "EEE, MMM d, yyyy")}
                            {event.time ? ` • ${event.time}` : ""}
                          </span>
                        </p>
                      )}

                      {event.location && (
                        <p className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0 text-teal-600 dark:text-teal-400" />
                          <span className="truncate">{event.location}</span>
                        </p>
                      )}
                    </div>

                    {event.description && (
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {event.description}
                      </p>
                    )}

                    {/* Action Bar (Calendar, Share, Directions) */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {/* Google Calendar Link */}
                      {dateVal && <a
                        href={getGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Add to Google Calendar"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <CalendarPlus size={13} />
                        <span>Google Cal</span>
                      </a>}

                      {/* Download ICS */}
                      <button
                        type="button"
                        onClick={() => downloadIcsFile(event)}
                        disabled={!dateVal}
                        title="Download iCal (.ics) file"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Clock size={13} />
                        <span>.ICS</span>
                      </button>

                      {/* Directions Link */}
                      {event.location && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Get directions in Google Maps"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Navigation size={13} />
                          <span>Map</span>
                        </a>
                      )}

                      {/* Share Link */}
                      <button
                        type="button"
                        onClick={() => handleShare(event)}
                        title="Share event link"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 ml-auto"
                      >
                        <Share2 size={13} />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Primary Card Buttons */}
                    <div className="mt-4 flex items-center gap-2.5 pt-2">
                      <Link
                        href={`/events/${event._id}`}
                        className="flex-1 rounded-xl bg-teal-800 py-2.5 text-center text-xs font-bold text-white transition hover:bg-teal-700 active:scale-[0.98]"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => setLeavingEvent(event)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                        title="Leave this event"
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Leaving Event */}
      {leavingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Trash2 size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Cancel Event Participation?
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to cancel your participation in <strong className="text-slate-900 dark:text-white">&ldquo;{leavingEvent.title}&rdquo;</strong>? Your volunteer slot will be made available to other community members.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLeavingEvent(null)}
                disabled={isLeaving}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Keep Participation
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isLeaving ? "Cancelling..." : "Yes, Leave Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
