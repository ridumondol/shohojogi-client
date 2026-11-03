# Shohojogi — Next.js 16 prerender fix

## What changed

- Moved every non-home route into `app/(main)/`. Route groups do not change public URL paths. The root home route remains `app/page.tsx` and keeps its existing embedded prototype chrome.
- Moved the shared `SiteShell` into `app/(main)/layout.tsx`; the home route no longer gets a duplicate header/footer.
- Wrapped the URL-dependent `SiteHeader` in a deterministic 65px Suspense fallback. The footer no longer calls `usePathname`; it is scoped to the `(main)` route-group layout, and is also under a matching structural fallback.
- Converted `app/(main)/events/[id]/page.tsx` into a Server Component. It awaits the Next.js 16 `params: Promise<{ id: string }>` inside a Suspense child and passes the ID to `EventDetailsClient.tsx`, which retains the current client-side fetch/join logic.
- `useSearchParams()` for edit-event remains inside the already existing page-level Suspense boundary.
- The current-date minimums for create/edit date inputs are now computed in `useEffect` and start from deterministic empty state, preventing another prerender-time `new Date()` unstable-value error.
- Replaced unavailable Lucide brand exports (`Github`, `Linkedin`) with small text brand marks and changed the footer year to a deterministic value (`2026`).
- Cache Components, Partial Prefetching, and Turbopack configuration are unchanged.

## Apply on Windows PowerShell 5.1

1. Keep the backend terminal running; the backend does not need to stop.
2. Stop only the frontend dev server with `Ctrl+C`.
3. Extract the ZIP into the existing `ShebaConnect` folder, choosing **Replace** for existing files.
4. Open PowerShell in `C:\Users\Hp\OneDrive\Desktop\P-8\ShebaConnect` and run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\APPLY-NEXT16-PRERENDER-FIX.ps1
   ```

   The script moves the old top-level route folders to a timestamped backup folder beside the project, because those old copies would otherwise conflict with the new route-group copies.
5. Clear the build cache and run the checks:

   ```powershell
   Remove-Item -LiteralPath .next -Recurse -Force -ErrorAction SilentlyContinue
   npm ci
   npx tsc --noEmit
   npm run lint
   npm run build
   ```

6. If every check passes, start the production server:

   ```powershell
   npm run start
   ```

   Keep the backend terminal (port 8000) open separately.

## Verification status in the preparation environment

- 85 TS/TSX files parsed through the installed TypeScript transpiler with zero syntax diagnostics.
- Static scan: `usePathname` remains only in `SiteHeader`, which is below Suspense; `useSearchParams` remains only in `EditEventForm`, which is below its page-level Suspense; there are no remaining `useParams`, `cookies()`, or `headers()` calls in app/components/lib/hooks.
- `npm ci --no-audit --no-fund` timed out in the preparation environment. The extracted workspace therefore has no complete dependency installation: `npm run build` cannot execute (`next: not found`), `npm run lint` cannot execute (`eslint: not found`), and `npm run typecheck` reports missing `@types` packages. No production build or browser E2E pass is claimed.
