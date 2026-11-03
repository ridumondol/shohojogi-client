import { Suspense } from "react";
import EventDetailsClient from "./EventDetailsClient";

function EventDetailsSkeleton() {
  return (
    <main className="min-h-[65vh] animate-pulse bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 sm:h-96" />
        <div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-11 w-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </main>
  );
}

async function EventDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetailsClient id={id} />;
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EventDetailsSkeleton />}>
      <EventDetailsContent params={params} />
    </Suspense>
  );
}
