"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarCheck2,
  CalendarDays,
  Edit3,
  MapPin,
  PlusCircle,
  Trash2,
  Users,
} from "lucide-react";
import { showToast } from "@/components/ui/toast-system";
import { formatEventDate } from "@/lib/event-date";

interface CreatedEventRecord {
  _id: string;
  title: string;
  category: string;
  eventType?: string;
  date: string;
  eventDate?: string;
  location: string;
  image: string;
  thumbnail?: string;
  description: string;
  attendeesCount?: number;
}

export default function MyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CreatedEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingEvent, setDeletingEvent] = useState<CreatedEventRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?returnTo=/my-events");
      return;
    }

    async function fetchMyEvents() {
      try {
        const response = await fetch("/api/events/my-events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login?returnTo=/my-events");
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load events");
        }

        setEvents(data.events || []);
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : "Failed to load your organized events.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyEvents();
  }, [router]);

  async function handleConfirmDelete() {
    if (!deletingEvent) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`/api/events/${deletingEvent._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete event.");
      }

      setEvents((prev) => prev.filter((ev) => ev._id !== deletingEvent._id));
      showToast.success(`Event "${deletingEvent.title}" deleted.`);
      setDeletingEvent(null);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </main>
    );
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
                <CalendarCheck2 size={14} />
                Organizer Portal
              </span>
              <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                Manage My Events
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Review, update, or remove community events that you have created.
              </p>
            </div>

            <Link
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] shrink-0"
            >
              <PlusCircle size={18} />
              Host New Event
            </Link>
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

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <Calendar size={32} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              No Events Created Yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              You have not created any community events yet. Start an initiative in your local neighbourhood today!
            </p>
            <Link
              href="/create-event"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
            >
              <PlusCircle size={17} />
              Host Your First Event
            </Link>
          </div>
        )}

        {/* Created Events Grid */}
        {!loading && events.length > 0 && (
          <>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Created Events: <strong>{events.length}</strong>
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const imageUrl = event.image || event.thumbnail;
                const category = event.category || event.eventType || "Volunteer";
                const dateVal = event.date || event.eventDate;

                return (
                  <article
                    key={event._id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
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

                      <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                        {category}
                      </span>
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

                      {/* Card Action Buttons */}
                      <div className="mt-auto pt-6 flex items-center gap-3">
                        <Link
                          href={`/edit-event?id=${event._id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          <Edit3 size={14} />
                          Edit Event
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeletingEvent(event)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                        >
                          <Trash2 size={14} />
                          Delete
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

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Trash2 size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Delete This Event Permanently?
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&ldquo;{deletingEvent.title}&rdquo;</strong>? This action cannot be undone and will remove all participant registrations.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
