"use client";

import { Suspense, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Edit3,
  MapPin,
  Save,
  Tag,
} from "lucide-react";
import { showToast } from "@/components/ui/toast-system";
import { getDateStringAfter } from "@/lib/event-date";
import { useToday } from "@/hooks/use-today";

const VALID_CATEGORIES = [
  "Volunteer",
  "Cleanup",
  "Plantation",
  "Donation",
  "Healthcare",
  "Education",
  "Blood Donation",
  "Food",
  "Relief",
  "Community Support",
];

function EditEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const today = useToday();
  const tomorrowMin = today ? getDateStringAfter(today, 1) : undefined;

  const [formData, setFormData] = useState({
    title: "",
    category: "Volunteer",
    date: "",
    location: "",
    image: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(`/login?returnTo=${encodeURIComponent(`/edit-event?id=${eventId || ""}`)}`);
      return;
    }

    async function fetchEvent() {
      if (!eventId) {
        showToast.error("Missing event ID.");
        router.replace("/my-events");
        return;
      }

      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load event.");
        }

        const ev = data.event;
        setFormData({
          title: ev.title || "",
          category: ev.category || ev.eventType || "Volunteer",
          date: ev.date ? ev.date.slice(0, 10) : "",
          location: ev.location || "",
          image: ev.image || ev.thumbnail || "",
          description: ev.description || "",
        });
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : "Failed to load event.");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId, router]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    const titleTrim = formData.title.trim();
    const locTrim = formData.location.trim();
    const imgTrim = formData.image.trim();
    const descTrim = formData.description.trim();

    if (!titleTrim) nextErrors.title = "Event title is required.";
    else if (titleTrim.length > 120) nextErrors.title = "Title must be 120 characters or fewer.";

    if (!formData.category) nextErrors.category = "Please select a category.";

    if (!formData.date) {
      nextErrors.date = "Event date is required.";
    } else if (!today) {
      nextErrors.date = "Please wait for the current date to load.";
    } else {
      if (formData.date <= today) {
        nextErrors.date = "Event date must be strictly in the future (tomorrow or later).";
      }
    }

    if (!locTrim) nextErrors.location = "Location is required.";
    else if (locTrim.length > 180) nextErrors.location = "Location must be 180 characters or fewer.";

    if (!imgTrim) {
      nextErrors.image = "Thumbnail image URL is required.";
    } else {
      try {
        const url = new URL(imgTrim);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          nextErrors.image = "Image URL must start with http:// or https://";
        }
      } catch {
        nextErrors.image = "Please provide a valid image URL.";
      }
    }

    if (!descTrim) nextErrors.description = "Event description is required.";
    else if (descTrim.length < 20) nextErrors.description = "Please write at least 2-3 meaningful sentences (min 20 characters).";
    else if (descTrim.length > 5000) nextErrors.description = "Description exceeds 5000 characters.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          date: formData.date,
          location: formData.location.trim(),
          image: formData.image.trim(),
          description: formData.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update event.");
      }

      showToast.success("Event updated successfully!");
      router.push("/my-events");
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Failed to update event.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="mx-auto max-w-3xl animate-pulse space-y-6">
          <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/my-events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
          >
            <ArrowLeft size={16} />
            Back to My Events
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            <Edit3 size={14} />
            Organizer Controls
          </span>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
            Edit Community Event
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Update event schedules, details, or venue instructions for your registered volunteers.
          </p>
        </section>

        {/* Form Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Event Title */}
            <div>
              <label htmlFor="edit-title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
                required
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.title
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label htmlFor="edit-category" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Event Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="edit-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {VALID_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <Tag size={15} className="pointer-events-none absolute right-3.5 top-3 text-slate-400" />
                </div>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="edit-date" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Event Date <span className="text-rose-500">* (Future Date Only)</span>
                </label>
                <div className="relative">
                  <input
                    id="edit-date"
                    name="date"
                    type="date"
                    min={tomorrowMin}
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                      errors.date
                        ? "border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                    }`}
                  />
                  <CalendarDays size={16} className="pointer-events-none absolute right-3.5 top-3 text-slate-400" />
                </div>
                {errors.date && (
                  <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="edit-location" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Location & City <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="edit-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength={180}
                  required
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                    errors.location
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                  }`}
                />
                <MapPin size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
              {errors.location && (
                <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.location}</p>
              )}
            </div>

            {/* Image Thumbnail */}
            <div>
              <label htmlFor="edit-image" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Thumbnail Image URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="edit-image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                    errors.image
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                  }`}
                />
                <Camera size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
              {errors.image && (
                <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.image}</p>
              )}

              {/* Live Preview Box */}
              {formData.image && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
                  <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                    <Image
                      src={formData.image}
                      alt="Thumbnail Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">Live image preview</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-desc" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="edit-desc"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                required
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.description
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/my-events"
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function EditEventPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-6 text-sm text-slate-500">
          Loading event details...
        </div>
      }
    >
      <EditEventForm />
    </Suspense>
  );
}
