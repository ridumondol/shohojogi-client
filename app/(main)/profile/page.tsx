"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          "/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setUser(data.user);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="rounded-lg bg-black px-5 py-2 text-white"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-green-100 text-3xl font-bold text-green-700">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.name}
                width={96}
                height={96}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {user.name}
          </h1>

          <p className="text-gray-500">{user.email}</p>
          <span className="mt-3 inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
            {user.role}
          </span>
        </div>

        <div className="space-y-5 border-t pt-6">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-semibold text-gray-900">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Account Role</p>
            <p className="font-semibold capitalize text-gray-900">
              {user.role}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-semibold text-gray-900">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}
