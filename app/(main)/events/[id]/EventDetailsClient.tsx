"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  Navigation,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { showToast } from "@/components/ui/toast-system";
import { formatEventDate } from "@/lib/event-date";

interface EventRecord {
  _id: string;
  title: string;
  category?: string;
  eventType?: string;
  date?: string;
  eventDate?: string;
  location?: string;
  image?: string;
  thumbnail?: string;
  description?: string;
  organizer?: string;
  creatorName?: string;
  organizerAvatar?: string;
  organizerEmail?: string;
  time?: string;
  attendeesCount?: number;
}

export default function EventDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${encodeURIComponent(id)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load event details.");
        setEvent(result.event);

        const token = localStorage.getItem("token");
        if (token) {
          const joinedResponse = await fetch("/api/events/my-joined-events", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (joinedResponse.ok) {
            const joinedResult = await joinedResponse.json();
            setJoined((joinedResult.events || []).some((item: EventRecord) => item._id === id));
          }
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load event details.");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  async function handleJoin() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?returnTo=${encodeURIComponent(`/events/${id}`)}`);
      return;
    }
    setJoining(true);
    try {
      const response = await fetch(`/api/events/${encodeURIComponent(id)}/join`, {
        method: joined ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to update your participation.");

      setJoined(!joined);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              attendeesCount: joined
                ? Math.max(0, (prev.attendeesCount || 1) - 1)
                : (prev.attendeesCount || 0) + 1,
            }
          : prev
      );

      if (joined) {
        showToast.info("Participation cancelled.");
      } else {
        showToast.success("You have successfully joined this community event!");
      }
    } catch (cause) {
      showToast.error(cause instanceof Error ? cause.message : "Unable to update your participation.");
    } finally {
      setJoining(false);
    }
  }

  async function handleShare() {
    if (!event) return;
    const shareData = {
      title: event.title,
      text: `Join "${event.title}" on Shohojogi!`,
      url: window.location.href,
    };
    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // cancelled
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      showToast.success("Event link copied to clipboard!");
    }
  }

  function downloadIcsFile() {
    if (!event) return;
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

  function getGoogleCalendarUrl() {
    if (!event) return "";
    const rawDate = event.date || event.eventDate;
    if (!rawDate) return "";
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.description || ""}\n\nOrganized via Shohojogi`);
    const location = encodeURIComponent(event.location || "Bangladesh");
    const dateStr = rawDate.slice(0, 10).replace(/-/g, "");
    const dates = `${dateStr}T090000Z/${dateStr}T130000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-2/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Unable to Load Event</h1>
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        <Link
          href="/events"
          className="mt-6 rounded-xl bg-teal-800 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700"
        >
          Back to Upcoming Events
        </Link>
      </main>
    );
  }

  if (!event) return null;

  const imageUrl = event.image || event.thumbnail;
  const category = event.category || event.eventType || "Volunteer Drive";
  const dateStr = event.date || event.eventDate;
  const organizerName = event.organizer || event.creatorName || "Community Organizer";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <article className="mx-auto max-w-4xl space-y-8">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
          >
            <ArrowLeft size={16} />
            Back to All Events
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Share2 size={14} />
            Share Event
          </button>
        </div>

        {/* Hero Card with Image */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                unoptimized
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Calendar size={48} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 text-white">
              <span className="rounded-full bg-teal-800/90 px-3.5 py-1 text-xs font-bold shadow backdrop-blur">
                {category}
              </span>
              {joined && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-bold shadow backdrop-blur">
                  <CheckCircle2 size={13} />
                  You are registered for this event
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {event.title}
              </h1>
            </div>

            {/* Quick Chips Info Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <CalendarDays size={14} className="text-teal-600 dark:text-teal-400" />
                  Date & Time
                </span>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {dateStr
                    ? formatEventDate(dateStr, "EEE, MMM d, yyyy")
                    : "Date coming soon"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {event.time || "09:00 AM - 01:00 PM"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <MapPin size={14} className="text-teal-600 dark:text-teal-400" />
                  Location
                </span>
                <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">
                  {event.location || "Location not announced"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <Users size={14} className="text-teal-600 dark:text-teal-400" />
                  Volunteers
                </span>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {event.attendeesCount ?? 0} Registered
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Community-powered initiative
                </p>
              </div>
            </div>

            {/* Organizer Card */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                {event.organizerAvatar ? (
                  <Image
                    src={event.organizerAvatar}
                    alt={organizerName}
                    width={44}
                    height={44}
                    unoptimized
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-teal-700/20"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-800 text-sm font-bold text-white">
                    {organizerName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{organizerName}</p>
                    <ShieldCheck size={14} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Event Coordinator • Shohojogi Verified</p>
                </div>
              </div>

              {event.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Navigation size={14} />
                  Get Directions
                </a>
              )}
            </div>

            {/* Description & Mission Details */}
            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                About this Community Initiative
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {event.description}
              </p>
            </div>

            {/* Utility Tool Actions: Directions, Calendar */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
              {dateStr && <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <CalendarPlus size={15} />
                Google Calendar
              </a>}

              <button
                type="button"
                onClick={downloadIcsFile}
                disabled={!dateStr}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Clock size={15} />
                Download iCal (.ics)
              </button>

              {event.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Navigation size={15} />
                  Directions
                </a>
              )}

              {/* Primary RSVP Join Button */}
              <button
                type="button"
                onClick={handleJoin}
                disabled={joining}
                className={`ml-auto inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm transition active:scale-[0.98] disabled:opacity-50 ${
                  joined
                    ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                    : "bg-teal-800 text-white hover:bg-teal-700"
                }`}
              >
                <HeartHandshake size={17} />
                {joining ? "Updating..." : joined ? "Cancel Participation" : "Join this Event"}
              </button>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
