
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  _id: string;
  title: string;
  type?: string;
  location?: string;
  eventDate?: string;
  description?: string;
}

export default function MyJoinedEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJoinedEvents() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          "/api/events/my-joined-events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load joined events");
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

    fetchJoinedEvents();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-950 px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 font-semibold text-green-400">
            SHОHOJOGI
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            My Joined Events
          </h1>

          <p className="mt-2 text-gray-400">
            Explore the community events you have joined.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading joined events...</p>
        ) : error ? (
          <p className="rounded-lg bg-red-950 p-4 text-red-400">
            {error}
          </p>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-xl font-semibold">
              No joined events found
            </p>

            <p className="mt-2 text-gray-400">
              You have not joined any community events yet.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-gray-400">
              Total Joined Events: {events.length}
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
                >
                  <span className="rounded-full bg-green-950 px-3 py-1 text-xs text-green-400">
                    {event.type || "Community Event"}
                  </span>

                  <h2 className="mt-5 text-xl font-bold">
                    {event.title}
                  </h2>

                  <p className="mt-3 text-sm text-gray-400">
                    📍 {event.location || "Location not available"}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    📅{" "}
                    {event.eventDate
                      ? new Date(event.eventDate).toLocaleDateString()
                      : "Date not available"}
                  </p>

                  {event.description && (
                    <p className="mt-4 text-sm text-gray-300">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-5 border-t border-gray-800 pt-4">
                    <span className="text-sm font-medium text-green-400">
                      ✓ Joined Successfully
                    </span>
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
