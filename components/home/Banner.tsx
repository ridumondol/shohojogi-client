"use client";

import Link from "next/link";
import Image from "next/image";

export default function Banner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-900/10 via-transparent to-transparent py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-amber-500" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" /></svg>
              Bangladesh&apos;s #1 Social Service Network
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Show up.{" "}
              <br className="hidden sm:inline" />
              <span className="text-teal-700 dark:text-teal-400">Serve together.</span>
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg lg:mx-0">
              Join hands with thousands of volunteers across Dhaka, Chattogram, Sylhet, and beyond. Organise warmth drives, environmental cleanups, and blood donation camps with ease.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row lg:justify-start">
              <Link
                href="/events"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-teal-800 hover:shadow-teal-700/30 sm:w-auto"
              >
                Upcoming Events
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link
                href="/create-event"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-teal-700 px-7 py-3.5 font-bold text-teal-700 transition hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-slate-900 sm:w-auto"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                Create an Event
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-8 dark:border-slate-800">
              <div>
                <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-400 sm:text-3xl">1,200+</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Volunteers</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-500 sm:text-3xl">340+</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Events Completed</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-400 sm:text-3xl">15,000+</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lives Impacted</p>
              </div>
            </div>
          </div>

          {/* Right: Hero image */}
          <div className="relative">
            <div className="relative z-10 overflow-hidden rounded-3xl border-4 border-white shadow-2xl dark:border-slate-800">
              <Image
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=900"
                alt="Volunteers distributing blankets at a community drive in Bangladesh"
                width={900}
                height={600}
                unoptimized
                className="h-80 w-full object-cover sm:h-96"
                priority
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-6">
                <div className="text-white">
                  <span className="mb-2 inline-block rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold text-slate-950">
                    Winter Drive 2026
                  </span>
                  <p className="text-lg font-bold">Mirpur 10 Night Blanket Distribution</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-amber-400" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                    Mirpur, Dhaka
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 z-20 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">100% Verified Drives</p>
                <p className="text-[10px] text-slate-500">Community reviewed organizers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
