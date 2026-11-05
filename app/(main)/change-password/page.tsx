"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { showToast } from "@/components/ui/toast-system";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?returnTo=/change-password");
    }
  }, [router]);

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!currentPassword) {
      nextErrors.currentPassword = "Enter your current account password.";
    }

    if (!passwordRule.test(newPassword)) {
      nextErrors.newPassword = "New password must be at least 6 characters, with uppercase and lowercase letters.";
    }

    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

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
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password change failed.");
      }

      showToast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});

      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            <ShieldCheck size={14} />
            Security Settings
          </span>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            Change Password
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Keep your Shohojogi volunteer account secure with a strong password.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          {/* Current Password */}
          <div>
            <label htmlFor="current-pw" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="current-pw"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: "" }));
                }}
                required
                autoComplete="current-password"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.currentPassword
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="new-pw" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="new-pw"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }));
                }}
                required
                autoComplete="new-password"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.newPassword
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">At least 6 characters, with uppercase and lowercase letters.</p>
            {errors.newPassword && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirm-pw" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm-pw"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                required
                autoComplete="new-password"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                  errors.confirmPassword
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-800 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/profile"
            className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            ← Back to My Profile
          </Link>
        </div>
      </div>
    </main>
  );
}
