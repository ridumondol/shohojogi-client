"use client";

import { useState, type FormEvent } from "react";

type State = "idle" | "success" | "error";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    // UI-only: no backend call
    setState("success");
    setMessage("You're subscribed! We'll send you weekly community drive alerts.");
    setEmail("");
  }

  return (
    <section className="bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 py-16 text-white">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold">Stay Connected to Community Drives</h2>
        <p className="mt-3 text-sm text-teal-200">
          Get weekly alerts for social drives near your city. No spam — just community action.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-2" noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setState("idle"); setMessage(""); }}
            placeholder="Enter your email"
            autoComplete="email"
            className="flex-1 rounded-xl border border-teal-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-describedby={state !== "idle" ? "newsletter-feedback" : undefined}
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow transition hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            Subscribe Now
          </button>
        </form>

        {state !== "idle" && (
          <p
            id="newsletter-feedback"
            role={state === "error" ? "alert" : "status"}
            className={`mt-3 text-sm ${state === "success" ? "text-green-300" : "text-red-300"}`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
