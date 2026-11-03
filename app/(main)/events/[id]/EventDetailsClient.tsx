"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EventRecord {
  _id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  image: string;
  description: string;
  organizer?: string;
  organizerAvatar?: string;
  attendeesCount?: number;
}

export default function EventDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${encodeURIComponent(id)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load event details.");
        setEvent(result.event);

        const token = localStorage.getItem("token");
        if (token) {
          const joinedResponse = await fetch("/api/events/my-joined-events", { headers: { Authorization: `Bearer ${token}` } });
          if (joinedResponse.ok) {
            const joinedResult = await joinedResponse.json();
            setJoined((joinedResult.events || []).some((item: EventRecord) => item._id === id));
          }
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load event details.");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  async function handleJoin() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?returnTo=${encodeURIComponent(`/events/${id}`)}`);
      return;
    }
    setJoining(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/events/${encodeURIComponent(id)}/join`, {
        method: joined ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to update your participation.");
      setJoined(!joined);
      setMessage(result.message || (joined ? "Participation cancelled." : "You have joined this event."));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update your participation.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) return <main className="min-h-[65vh] animate-pulse px-4 py-12"><div className="mx-auto max-w-4xl space-y-5"><div className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800" /><div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" /><div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" /><div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" /></div></main>;

  if (error && !event) return <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"><h1 className="text-2xl font-bold">Unable to load event</h1><p className="mt-2 text-red-600">{error}</p><Link href="/events" className="mt-5 rounded-xl bg-teal-800 px-5 py-3 font-bold text-white">Back to Upcoming Events</Link></main>;
  if (!event) return null;

  return (
    <main className="min-h-[65vh] bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <Image
          src={event.image}
          alt={event.title}
          width={1200}
          height={600}
          unoptimized
          className="h-64 w-full object-cover sm:h-96"
        />
        <div className="p-6 sm:p-9">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">{event.category}</span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{event.title}</h1>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2"><p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p><p><strong>Location:</strong> {event.location}</p><p><strong>Organizer:</strong> {event.organizer || "Community Organizer"}</p><p><strong>Participants:</strong> {event.attendeesCount ?? 0}</p></div>
          <div className="my-7 border-t border-slate-200 dark:border-slate-700" />
          <h2 className="text-xl font-bold">About this event</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-slate-700 dark:text-slate-300">{event.description}</p>
          {message && <p role="status" className="mt-6 rounded-xl bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950/50 dark:text-green-300">{message}</p>}
          {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
          <div className="mt-8 flex flex-wrap gap-3"><button onClick={handleJoin} disabled={joining} className="rounded-xl bg-teal-800 px-6 py-3 font-bold text-white transition hover:bg-teal-700 disabled:opacity-60">{joining ? "Please wait…" : joined ? "Cancel Participation" : "Join Event"}</button><Link href="/events" className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Back to Events</Link></div>
        </div>
      </article>
    </main>
  );
}
