"use client";

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, HeartHandshake, AlertCircle, Loader2 } from "lucide-react";

/**
 * Official Google Multi-Color SVG Icon
 */
function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * Official GitHub Monochromatic SVG Icon
 */
function GitHubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

/**
 * Reusable Horizontal Divider with Centered Label
 */
function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="w-full border-t border-slate-200 dark:border-slate-800" aria-hidden="true" />
      <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}

/**
 * Reusable Social Login Button with Consistent States
 */
interface SocialLoginButtonProps {
  label: string;
  ariaLabel: string;
  icon: ReactNode;
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function SocialLoginButton({
  label,
  ariaLabel,
  icon,
  isLoading,
  isDisabled,
  onClick,
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-950 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:hover:border-slate-600 dark:hover:text-white disabled:pointer-events-none disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin text-teal-600 dark:text-teal-400" aria-hidden="true" />
      ) : (
        icon
      )}
      <span className="truncate">{isLoading ? "Connecting..." : label}</span>
    </button>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Derived error from URL query parameter (React 19 pattern: derive during render)
  const queryError = searchParams.get("error") || "";
  const displayError = serverError || queryError;

  // Destination resolver: safe relative redirect
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo =
    rawReturnTo && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
      ? rawReturnTo
      : "/dashboard";

  // Check for incoming OAuth redirect success params
  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (oauthSuccess === "1" && token) {
      try {
        localStorage.setItem("token", token);
        if (userParam) {
          localStorage.setItem("user", decodeURIComponent(userParam));
        }
        window.dispatchEvent(new Event("shohojogi-auth-change"));
        router.replace(returnTo);
      } catch {
        router.replace(returnTo);
      }
    }
  }, [searchParams, returnTo, router]);

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Persist token & user in localStorage for immediate client navbar/state sync
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Notify Navbar and other session listeners
      window.dispatchEvent(new Event("shohojogi-auth-change"));

      // Redirect user to their intended destination
      router.push(returnTo);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the authentication server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    setOauthLoading("google");
    setServerError("");
    const targetUrl = new URL("/api/users/oauth/google", window.location.origin);
    targetUrl.searchParams.set("returnTo", returnTo);
    window.location.assign(targetUrl.href);
  }

  function handleGitHubLogin() {
    setOauthLoading("github");
    setServerError("");
    const targetUrl = new URL("/api/users/oauth/github", window.location.origin);
    targetUrl.searchParams.set("returnTo", returnTo);
    window.location.assign(targetUrl.href);
  }

  const isFormBusy = loading || oauthLoading !== null;

  return (
    <div className="w-full max-w-md">
      {/* 1. Page Heading and Subtitle */}
      <div className="mb-6 text-center sm:mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-teal-800 p-2 text-amber-300 shadow-md transition hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-teal-500"
          aria-label="Back to Shohojogi homepage"
        >
          <HeartHandshake size={28} aria-hidden="true" />
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in to your Shohojogi account to manage and join community events.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* Server / Network Error Alert */}
        {displayError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold">Sign In Failed</p>
              <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">{displayError}</p>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {/* 2. Email Input */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail size={17} aria-hidden="true" />
              </div>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isFormBusy}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="name@example.com"
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950 disabled:opacity-60 ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700 dark:focus:border-teal-400"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p id="email-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* 3. Password Input (with show/hide toggle) */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Password <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock size={17} aria-hidden="true" />
              </div>
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={isFormBusy}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Enter your password"
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950 disabled:opacity-60 ${
                  fieldErrors.password
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700 dark:focus:border-teal-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isFormBusy}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-600 focus:outline-none dark:hover:text-slate-200 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* 4. Primary "Login" Submit Button */}
          <button
            type="submit"
            disabled={isFormBusy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3 text-sm font-bold text-white shadow-md transition-all duration-150 hover:bg-teal-800 hover:shadow-teal-700/20 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-700 dark:hover:bg-teal-600"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* 5. Text: "Don't have an account? Register" */}
        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-teal-700 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded dark:text-teal-400"
          >
            Register
          </Link>
        </p>

        {/* 6. Divider with "or continue with" */}
        <Divider label="or continue with" />

        {/* 7. Two Social Login Buttons Below the Divider */}
        {/* Responsive: vertical stack on mobile, side-by-side on screens >= 640px */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SocialLoginButton
            label="Continue with Google"
            ariaLabel="Sign in with Google"
            icon={<GoogleIcon className="h-4 w-4 shrink-0" />}
            isLoading={oauthLoading === "google"}
            isDisabled={isFormBusy}
            onClick={handleGoogleLogin}
          />
          <SocialLoginButton
            label="Continue with GitHub"
            ariaLabel="Sign in with GitHub"
            icon={<GitHubIcon className="h-4 w-4 shrink-0 text-slate-900 dark:text-white" />}
            isLoading={oauthLoading === "github"}
            isDisabled={isFormBusy}
            onClick={handleGitHubLogin}
          />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12 transition-colors dark:bg-slate-950 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex h-64 w-full max-w-md items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <Loader2 size={28} className="animate-spin text-teal-700" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
