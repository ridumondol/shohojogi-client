"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Eye, EyeOff, Mail, User, UserPlus } from "lucide-react";
import { showToast } from "@/components/ui/toast-system";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (photoURL.trim() && !/^https?:\/\//i.test(photoURL.trim())) nextErrors.photoURL = "Use a valid HTTP or HTTPS photo URL.";
    if (!passwordRule.test(password)) nextErrors.password = "Use at least 6 characters, including one uppercase and one lowercase letter.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), photoURL: photoURL.trim(), password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Registration failed.");

      showToast.success("Account created successfully! You can now log in.");
      setTimeout(() => router.push("/login?registered=1"), 900);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Registration failed.";
      setErrors({ form: msg });
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            <UserPlus size={14} />
            Join Shohojogi
          </span>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Create an Account</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Join thousands of volunteers making local social change happen together.</p>
        </div>

        {errors.form && (
          <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            {errors.form}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
          <div>
            <label htmlFor="register-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="register-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                required
                maxLength={80}
                autoComplete="name"
                placeholder="e.g. Tanvir Ahmed"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.name ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              <User size={15} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
            {errors.name && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.email ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              <Mail size={15} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
            {errors.email && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="register-photo" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Profile Photo URL <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <input
                id="register-photo"
                type="url"
                value={photoURL}
                onChange={(e) => {
                  setPhotoURL(e.target.value);
                  if (errors.photoURL) setErrors((prev) => ({ ...prev, photoURL: "" }));
                }}
                placeholder="https://images.unsplash.com/..."
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.photoURL ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              <Camera size={15} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
            {errors.photoURL && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.photoURL}</p>}

            {photoURL && /^https?:\/\//i.test(photoURL) && (
              <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-teal-700/20">
                  <Image src={photoURL} alt="Preview" width={32} height={32} unoptimized className="h-full w-full object-cover" />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Live avatar preview</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.password ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">At least 6 characters, one uppercase letter, and one lowercase letter.</p>
            {errors.password && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-800 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-teal-700 hover:underline dark:text-teal-300">
            Log in to your account
          </Link>
        </p>
      </section>
    </main>
  );
}
