"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (photoURL && !/^https?:\/\//i.test(photoURL)) nextErrors.photoURL = "Use a valid HTTP or HTTPS photo URL.";
    if (!passwordRule.test(password)) nextErrors.password = "Use at least 6 characters, including one uppercase and one lowercase letter.";
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), photoURL: photoURL.trim(), password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Registration failed.");
      setMessage("Your account has been created. You can now log in.");
      setTimeout(() => router.push("/login?registered=1"), 900);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Registration failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300">Join the community</p>
        <h1 className="mt-2 text-center text-3xl font-extrabold">Create your account</h1>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">Make it easier to show up and serve together.</p>
        {message && <p role="status" className="mt-6 rounded-xl bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950/50 dark:text-green-300">{message}</p>}
        {errors.form && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{errors.form}</p>}
        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
          <div><label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold">Full name</label><input id="register-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950" />{errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}</div>
          <div><label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold">Email address</label><input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950" />{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}</div>
          <div><label htmlFor="register-photo" className="mb-1.5 block text-sm font-semibold">Profile photo URL <span className="font-normal text-slate-500">(optional)</span></label><input id="register-photo" type="url" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950" />{errors.photoURL && <p className="mt-1 text-xs text-red-600">{errors.photoURL}</p>}</div>
          <div><label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold">Password</label><input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950" /><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">At least 6 characters, one uppercase letter, and one lowercase letter.</p>{errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}</div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-teal-800 px-5 py-3 font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account…" : "Create Account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">Already registered? <Link href="/login" className="font-bold text-teal-700 hover:underline dark:text-teal-300">Log in</Link></p>
      </section>
    </main>
  );
}
