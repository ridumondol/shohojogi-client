
"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function subscribeToNothing() {
  return () => {};
}

function getMinimumDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function EditEventForm() {
  const minimumDate = useSyncExternalStore(
    subscribeToNothing,
    getMinimumDate,
    () => ""
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    image: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        if (!eventId) {
          setError("Event ID not found.");
          return;
        }

        const response = await fetch(
          `/api/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load event.");
        }

        const event = data.event;

        setFormData({
          title: event.title || "",
          category: event.category || "",
          date: event.date
            ? new Date(event.date).toISOString().split("T")[0]
            : "",
          location: event.location || "",
          image: event.image || "",
          description: event.description || "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update event.");
      }

      setMessage("Event updated successfully!");

      setTimeout(() => {
        router.push("/my-events");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-center text-gray-400">
        Loading event details...
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-3 text-3xl font-bold">Edit Event</h1>

        <p className="mb-8 text-gray-400">
          Update your community event information.
        </p>

        {error && (
          <p className="mb-5 rounded-lg bg-red-950 p-4 text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-5 rounded-lg bg-green-950 p-4 text-green-400">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900 p-6"
        >
          <div>
            <label className="mb-2 block text-sm">Event Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Category</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Event Date</label>
            <input
              type="date"
              min={minimumDate}
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 outline-none focus:border-green-400"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-green-400 px-5 py-3 font-semibold text-gray-950 hover:bg-green-300 disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Event"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/my-events")}
              className="rounded-lg border border-gray-700 px-5 py-3 font-semibold hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditEventPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-950 p-10 text-center text-gray-400">
          Loading Edit Event Page...
        </main>
      }
    >
      <EditEventForm />
    </Suspense>
  );
}
