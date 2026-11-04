
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";

function subscribeToNothing() {
  return () => {};
}

function getMinimumDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTokenSnapshot() {
  try {
    return localStorage.getItem("token") ?? "";
  } catch {
    return "";
  }
}

function subscribeToToken(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export default function CreateEventPage() {
  const router = useRouter();
  const token = useSyncExternalStore(
    subscribeToToken,
    getTokenSnapshot,
    () => null
  );
  const minimumDate = useSyncExternalStore(
    subscribeToNothing,
    getMinimumDate,
    () => ""
  );

  const [formData, setFormData] = useState({
    title: "",
    category: "Volunteer",
    date: "",
    location: "",
    image: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Redirect only after the browser has checked the stored session.
  useEffect(() => {
    if (token === "") {
      router.replace("/login?returnTo=/create-event");
    }
  }, [router, token]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(`${formData.date}T00:00:00`).toISOString(),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create event");
      }

      setMessage("Event created successfully!");
      window.setTimeout(() => {
        router.push("/events?created=1");
      }, 700);

      setFormData({
        title: "",
        category: "Volunteer",
        date: "",
        location: "",
        image: "",
        description: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  if (token === null || token === "") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <p className="text-gray-400">Checking login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 font-semibold text-green-400">SHOHOJOGI</p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Create New Event
          </h1>

          <p className="mt-2 text-gray-400">
            Bring your community together and make a difference.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8"
        >
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Event Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Event Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-green-500"
            >
              <option value="Cleanup">Cleanup</option>
              <option value="Plantation">Plantation</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Donation">Donation</option>
              <option value="Environment">Environment</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Community">Community</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Location
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Event Date
            </label>
            <input
              type="date"
              min={minimumDate}
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Event Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/event-image.jpg"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-green-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              Paste a publicly accessible image URL.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Event Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your community event..."
              rows={5}
              required
              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          {message && (
            <p className="rounded-lg bg-green-950 p-4 text-green-400">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-950 p-4 text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-500 py-3 font-semibold text-gray-950 transition hover:bg-green-400 disabled:opacity-50"
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </form>
      </div>
    </main>
  );
}
