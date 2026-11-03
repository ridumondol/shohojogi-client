"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  totalParticipants: number;
  upcomingEvents: number;
  eventsCreated: number;
  eventsJoined: number;
  completedEvents: number;
  myTotalParticipants: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalUsers: 0,
    totalParticipants: 0,
    upcomingEvents: 0,
    eventsCreated: 0,
    eventsJoined: 0,
    completedEvents: 0,
    myTotalParticipants: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          "/api/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard");
        }

        setStats(data.stats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const cards = [
    { title: "Total Events", value: stats.totalEvents, icon: "📅" },
    { title: "Total Users", value: stats.totalUsers, icon: "👥" },
    { title: "Total Participants", value: stats.totalParticipants, icon: "🤝" },
    { title: "Upcoming Events", value: stats.upcomingEvents, icon: "🌱" },
  ];

  const impactCards = [
    {
      title: "Events Created",
      value: stats.eventsCreated,
      icon: "📝",
      description: "Events you organized",
    },
    {
      title: "Events Joined",
      value: stats.eventsJoined,
      icon: "🙌",
      description: "Events you participated in",
    },
    {
      title: "Completed Events",
      value: stats.completedEvents,
      icon: "🏆",
      description: "Joined events that have passed",
    },
    {
      title: "Participants in Your Events",
      value: stats.myTotalParticipants,
      icon: "❤️",
      description: "People joining your events",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900 transition-colors duration-200 dark:bg-gray-950 dark:text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">
              SHOHOJOGI DASHBOARD
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              Welcome to Dashboard
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your community activities and events.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        ) : (
          <>
            <h2 className="mb-5 text-2xl font-bold">Platform Overview</h2>

            <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="mb-5 text-3xl">{card.icon}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                    {card.value}
                  </h3>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">
                YOUR CONTRIBUTION
              </p>
              <h2 className="text-2xl font-bold">My Impact 🌍</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Every small action creates a positive change in the community.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {impactCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-green-200 bg-white p-6 transition-colors hover:border-green-500 dark:border-green-900/50 dark:bg-gray-900"
                >
                  <div className="mb-5 text-3xl">{card.icon}</div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                    {card.value}
                  </h3>

                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
