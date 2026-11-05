"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  HeartHandshake,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { showToast } from "@/components/ui/toast-system";
import { formatTimestamp } from "@/lib/event-date";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  bio?: string;
  location?: string;
  role: string;
  createdAt?: string;
}

interface UserStats {
  eventsCreated: number;
  eventsJoined: number;
  completedEvents: number;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    eventsCreated: 0,
    eventsJoined: 0,
    completedEvents: 0,
  });

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadProfileAndStats() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login?returnTo=/profile");
        return;
      }

      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.status === 401 || profileRes.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login?returnTo=/profile");
          return;
        }

        const profileData = await profileRes.json();
        if (!profileRes.ok) throw new Error(profileData.message || "Failed to load profile.");

        const userData: UserProfile = profileData.user;
        setUser(userData);
        setName(userData.name || "");
        setPhotoURL(userData.photoURL || "");
        setPhone(userData.phone || "");
        setBio(userData.bio || "");
        setLocation(userData.location || "");

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.stats) {
            setStats({
              eventsCreated: statsData.stats.eventsCreated || 0,
              eventsJoined: statsData.stats.eventsJoined || 0,
              completedEvents: statsData.stats.completedEvents || 0,
            });
          }
        }
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndStats();
  }, [router]);

  function validate() {
    const errors: Record<string, string> = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      errors.name = "Full name is required.";
    } else if (trimmedName.length > 80) {
      errors.name = "Name must be 80 characters or fewer.";
    }

    if (photoURL.trim()) {
      try {
        const url = new URL(photoURL.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.photoURL = "Please enter a valid HTTP or HTTPS image URL.";
        }
      } catch {
        errors.photoURL = "Please enter a valid photo URL.";
      }
    }

    if (phone.trim() && phone.trim().length > 25) {
      errors.phone = "Phone number must be 25 characters or fewer.";
    }

    if (bio.trim().length > 500) {
      errors.bio = "Bio must be 500 characters or fewer.";
    }

    if (location.trim().length > 100) {
      errors.location = "Location must be 100 characters or fewer.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login?returnTo=/profile");
      return;
    }

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          photoURL: photoURL.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          location: location.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      const updatedUser: UserProfile = data.user;
      setUser(updatedUser);

      // Persist in localStorage and dispatch reactive event for immediate navbar update
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("shohojogi-auth-change"));

      showToast.success("Profile updated successfully!");
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Profile Header Card */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Live Profile Avatar with ring */}
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-teal-100 shadow-md ring-4 ring-teal-700/20 dark:border-slate-800 dark:bg-teal-950">
                {photoURL ? (
                  <Image
                    src={photoURL}
                    alt={name || user.name}
                    width={112}
                    height={112}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-teal-800 dark:text-teal-300">
                    {(name || user.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-teal-800 text-white shadow">
                <Sparkles size={14} />
              </span>
            </div>

            {/* User Meta Information */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                  {user.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                  <ShieldCheck size={13} />
                  {user.role === "admin" ? "Community Administrator" : "Active Volunteer"}
                </span>
              </div>

              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 sm:justify-start">
                <Mail size={14} />
                {user.email}
              </p>

              {user.bio && (
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {user.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 sm:justify-start">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-teal-600 dark:text-teal-400" />
                    {user.location}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-teal-600 dark:text-teal-400" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  Joined {user.createdAt
                    ? formatTimestamp(user.createdAt, { month: "short", year: "numeric" })
                    : "Recently"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Volunteer Impact Statistics Bar */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Events Created</span>
              <span className="rounded-xl bg-teal-100 p-2 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <CalendarCheck size={18} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              {stats.eventsCreated}
            </p>
            <Link
              href="/my-events"
              className="mt-2 inline-block text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400"
            >
              Manage created events →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Events Joined</span>
              <span className="rounded-xl bg-amber-100 p-2 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <HeartHandshake size={18} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              {stats.eventsJoined}
            </p>
            <Link
              href="/my-joined-events"
              className="mt-2 inline-block text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400"
            >
              View joined events →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Events</span>
              <span className="rounded-xl bg-emerald-100 p-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 size={18} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              {stats.completedEvents}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Past verified community events
            </p>
          </div>
        </section>

        {/* Edit Profile Form Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Edit Profile Information
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Update your personal information and photo. Changes will reflect instantly across the application.
              </p>
            </div>
            <Link
              href="/change-password"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <KeyRound size={14} />
              Change Password
            </Link>
          </div>

          <form onSubmit={handleUpdateProfile} noValidate className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    required
                    maxLength={80}
                    placeholder="e.g. Tanvir Ahmed"
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                      formErrors.name
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{formErrors.name}</p>
                )}
              </div>

              {/* Email Address (Read-only) */}
              <div>
                <label htmlFor="profile-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address <span className="font-normal text-slate-400">(Read-Only)</span>
                </label>
                <div className="relative">
                  <input
                    id="profile-email"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
                  />
                  <Lock size={15} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Account login email cannot be modified.</p>
              </div>

              {/* Profile Photo URL */}
              <div className="sm:col-span-2">
                <label htmlFor="profile-photo" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Profile Photo URL <span className="font-normal text-slate-400">(HTTP or HTTPS)</span>
                </label>
                <div className="relative">
                  <input
                    id="profile-photo"
                    type="url"
                    value={photoURL}
                    onChange={(e) => {
                      setPhotoURL(e.target.value);
                      if (formErrors.photoURL) setFormErrors((prev) => ({ ...prev, photoURL: "" }));
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                      formErrors.photoURL
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                    }`}
                  />
                  <Camera size={16} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                {formErrors.photoURL && (
                  <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{formErrors.photoURL}</p>
                )}
                {photoURL && (
                  <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-teal-700/30">
                      <Image
                        src={photoURL}
                        alt="Photo Preview"
                        width={40}
                        height={40}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live avatar preview</p>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="profile-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    maxLength={25}
                    placeholder="+880 1712-345678"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <Phone size={15} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{formErrors.phone}</p>
                )}
              </div>

              {/* Location / Area */}
              <div>
                <label htmlFor="profile-location" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  City / Neighbourhood
                </label>
                <div className="relative">
                  <input
                    id="profile-location"
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (formErrors.location) setFormErrors((prev) => ({ ...prev, location: "" }));
                    }}
                    maxLength={100}
                    placeholder="e.g. Dhanmondi, Dhaka"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <MapPin size={15} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                {formErrors.location && (
                  <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{formErrors.location}</p>
                )}
              </div>

              {/* Bio / About */}
              <div className="sm:col-span-2">
                <label htmlFor="profile-bio" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Bio / Community Mission <span className="font-normal text-slate-400">({500 - bio.length} chars remaining)</span>
                </label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    if (formErrors.bio) setFormErrors((prev) => ({ ...prev, bio: "" }));
                  }}
                  maxLength={500}
                  placeholder="Tell the community about your volunteering interests, past events, or skills you can share..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                {formErrors.bio && (
                  <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{formErrors.bio}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Back to Dashboard
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
