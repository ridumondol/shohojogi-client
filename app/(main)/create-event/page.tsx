"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  Camera,
  MapPin,
  Sparkles,
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

export default function CreateEventPage() {
  const router = useRouter();
  const today = useToday();

  const [formData, setFormData] = useState({
    title: "",
    category: "Volunteer",
    date: "",
    location: "",
    image: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const tomorrowMin = today ? getDateStringAfter(today, 1) : undefined;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?returnTo=/create-event");
    }
  }, [router]);

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

    if (!locTrim) nextErrors.location = "Location or neighbourhood is required.";
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

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login?returnTo=/create-event");
        return;
      }

      const response = await fetch("/api/events", {
        method: "POST",
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

      showToast.success("Community event published successfully!");
      router.push("/events?created=1");
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            <CalendarPlus size={14} />
            Community Action
          </span>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
            Host a Community Event
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Mobilise volunteers for a warmth distribution, medical camp, or tree plantation event in your city.
          </p>
        </section>

        {/* Create Event Form Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Event Title */}
            <div>
              <label htmlFor="event-title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Winter Clothes Distribution – Mirpur 10"
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
              {/* Event Category */}
              <div>
                <label htmlFor="event-category" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Event Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="event-category"
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

              {/* Event Date (Strictly Future) */}
              <div>
                <label htmlFor="event-date" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Event Date <span className="text-rose-500">* (Future Date Only)</span>
                </label>
                <div className="relative">
                  <input
                    id="event-date"
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
              <label htmlFor="event-location" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Location & City <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="event-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Mirpur 10 Community Center, Dhaka"
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

            {/* Image Thumbnail URL with Live Preview */}
            <div>
              <label htmlFor="event-image" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Thumbnail Image URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="event-image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
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

            {/* Event Description */}
            <div>
              <label htmlFor="event-desc" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="event-desc"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the mission, schedule, volunteer roles, and items needed for this community event..."
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
                href="/events"
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={15} />
                {loading ? "Publishing Event..." : "Publish Event"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
