
"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  _id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  image: string;
  description: string;
}

export default function MyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyEvents() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          "/api/events/my-events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load events");
        }

        setEvents(data.events || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMyEvents();
  }, [router]);

  async function handleDelete(eventId: string) {
    setConfirmingId(null);

    try {
      setDeletingId(eventId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete event");
      }

      setEvents((previousEvents) =>
        previousEvents.filter((event) => event._id !== eventId)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete event"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 font-semibold text-green-400">
            SHOHOJOGI
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            My Events
          </h1>

          <p className="mt-2 text-gray-400">
            Manage the community events you have created.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading your events...</p>
        ) : error && events.length === 0 ? (
          <p className="rounded-lg bg-red-950 p-4 text-red-400">
            {error}
          </p>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-xl font-semibold">No events found</p>
            <p className="mt-2 text-gray-400">
              You have not created any events yet.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-5 rounded-lg bg-red-950 p-4 text-red-400">
                {error}
              </p>
            )}

            <p className="mb-5 text-gray-400">
              Total Events: {events.length}
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
                >
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={800}
                      height={450}
                      unoptimized
                      className="mb-5 h-44 w-full rounded-xl object-cover"
                    />
                  )}

                  <span className="rounded-full bg-green-950 px-3 py-1 text-xs text-green-400">
                    {event.category || "Community Event"}
                  </span>

                  <h2 className="mt-5 text-xl font-bold">
                    {event.title}
                  </h2>

                  <p className="mt-3 text-sm text-gray-400">
                    📍 {event.location || "Location not available"}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    📅{" "}
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "Date not available"}
                  </p>

                  {event.description && (
                    <p className="mt-4 text-sm text-gray-300">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() =>
                        router.push(`/edit-event?id=${event._id}`)
                      }
                      className="flex-1 rounded-lg bg-green-400 px-3 py-3 text-sm font-semibold text-gray-950 transition hover:bg-green-300"
                    >
                      Edit
                    </button>

                    {confirmingId === event._id ? (
                      <div className="flex flex-1 flex-col gap-2 rounded-lg border border-red-500/40 bg-red-950/30 p-2">
                        <p className="text-center text-xs text-red-300">Delete this event permanently?</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            className="flex-1 rounded-md border border-gray-600 px-2 py-2 text-xs text-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(event._id)}
                            disabled={deletingId === event._id}
                            className="flex-1 rounded-md bg-red-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {deletingId === event._id ? "Deleting..." : "Confirm"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(event._id)}
                        disabled={deletingId === event._id}
                        className="flex-1 rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
