
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Event {
  _id: string;
  title: string;
  category?: string;
  location?: string;
  date?: string;
  image?: string;
  description?: string;
}

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasCreated = searchParams.get("created") === "1";
  const [events, setEvents] = useState<Event[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("");

  const fetchEvents = useCallback(async function fetchEvents() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "/api/events"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load events.");
      }

      setEvents(data.events || []);

      if (token) {
        const joinedResponse = await fetch(
          "/api/events/my-joined-events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const joinedData = await joinedResponse.json();

        if (joinedResponse.ok) {
          setJoinedIds(
            (joinedData.events || []).map(
              (event: Event) => event._id
            )
          );
        } else if (
          joinedResponse.status === 401 ||
          joinedResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setJoinedIds([]);
        }
      } else {
        setJoinedIds([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      await fetchEvents();
    }
    if (!ignore) {
      void load();
    }
    return () => {
      ignore = true;
    };
  }, [fetchEvents]);

  async function handleJoin(eventId: string) {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push(`/login?returnTo=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }

    setActionId(eventId);
    setError("");
    setMessage("");

    try {
      const isJoined = joinedIds.includes(eventId);

      const response = await fetch(
        `/api/events/${eventId}/join`,
        {
          method: isJoined ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        throw new Error(data.message || "Action failed.");
      }

      if (isJoined) {
        setJoinedIds((previous) =>
          previous.filter((id) => id !== eventId)
        );

        setMessage("You have left the event.");
      } else {
        setJoinedIds((previous) => [...previous, eventId]);

        setMessage("You have successfully joined the event!");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setActionId("");
    }
  }

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          events
            .map((event) => event.category)
            .filter(
              (category): category is string => Boolean(category)
            )
        )
      ),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        event.title.toLowerCase().includes(searchText) ||
        (event.description || "")
          .toLowerCase()
          .includes(searchText) ||
        (event.location || "")
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        selectedCategory === "All" ||
        event.category === selectedCategory;

      const matchesLocation = (event.location || "")
        .toLowerCase()
        .includes(selectedLocation.toLowerCase());

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation
      );
    });
  }, [events, search, selectedCategory, selectedLocation]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSelectedLocation("");
  }

  return (
    <main className="min-h-screen bg-gray-950 px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-10">
          <p className="mb-2 font-semibold text-green-400">
            SHOHOJOGI
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Discover Events
          </h1>

          <p className="mt-2 text-gray-400">
            Find community events and make a positive difference.
          </p>
        </div>

        {(message || wasCreated) && (
          <div className="mb-5 rounded-lg bg-green-950 p-4 text-green-400">
            {message || "Your event was created successfully and is now listed in Upcoming Events."}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-800 bg-red-950 p-5">
            <p className="font-semibold text-red-400">
              Something went wrong!
            </p>

            <p className="mt-2 text-sm text-red-300">
              {error}
            </p>

            <button
              onClick={fetchEvents}
              disabled={loading}
              className="mt-4 rounded-lg bg-red-500 px-5 py-2 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Try Again"}
            </button>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="mb-8 grid gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-5 md:grid-cols-3">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event name or description..."
              className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500"
            />

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500"
            >
              <option value="All">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={selectedLocation}
              onChange={(e) =>
                setSelectedLocation(e.target.value)
              }
              placeholder="Filter by location..."
              className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500"
            />

            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 md:col-span-3"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-lg font-semibold text-green-400">
              Loading events...
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Please wait while we load the events.
            </p>
          </div>
        ) : error && events.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-xl font-semibold">
              Unable to load events
            </p>
            <p className="mt-2 text-gray-400">
              Please check your connection and try again.
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-xl font-semibold">
              No events available
            </p>
            <p className="mt-2 text-gray-400">
              Please check again later.
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-xl font-semibold">
              No matching events found
            </p>
            <p className="mt-2 text-gray-400">
              Try another search or category.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-green-500 px-5 py-2 font-semibold text-gray-950 hover:bg-green-400"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-gray-400">
              Showing {filteredEvents.length} of {events.length} events
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const isJoined = joinedIds.includes(event._id);

                return (
                  <div
                    key={event._id}
                    className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900"
                  >
                    {event.image && (
                      <Image
                        src={event.image}
                        alt={event.title}
                        width={800}
                        height={450}
                        unoptimized
                        className="h-48 w-full object-cover"
                      />
                    )}

                    <div className="p-6">
                      <span className="rounded-full bg-green-950 px-3 py-1 text-xs text-green-400">
                        {event.category || "Community Event"}
                      </span>

                      <h2 className="mt-5 text-xl font-bold">
                        {event.title}
                      </h2>

                      <p className="mt-3 text-sm text-gray-400">
                        Location: {event.location || "Not available"}
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        Date:{" "}
                        {event.date
                          ? new Date(event.date).toLocaleDateString()
                          : "Not available"}
                      </p>

                      {event.description && (
                        <p className="mt-4 text-sm text-gray-300">
                          {event.description}
                        </p>
                      )}

                      <Link
                        href={`/events/${event._id}`}
                        className="mt-6 block w-full rounded-lg border border-gray-600 px-4 py-3 text-center font-semibold text-gray-200 transition hover:bg-gray-800"
                      >
                        View Event
                      </Link>

                      <button
                        onClick={() => handleJoin(event._id)}
                        disabled={actionId === event._id}
                        className={`mt-6 w-full rounded-lg py-3 font-semibold transition disabled:opacity-50 ${
                          isJoined
                            ? "border border-red-500 text-red-400 hover:bg-red-950"
                            : "bg-green-500 text-gray-950 hover:bg-green-400"
                        }`}
                      >
                        {actionId === event._id
                          ? "Please wait..."
                          : isJoined
                            ? "Cancel Participation"
                            : "Join Event"}
                      </button>
                    </div>
                  </div>
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
        <main className="min-h-screen bg-gray-950 px-5 py-10 text-center text-gray-400">
          Loading events...
        </main>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
