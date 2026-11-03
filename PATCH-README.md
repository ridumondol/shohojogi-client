# Shohojogi lint-fix patch

This patch contains 11 updated frontend files. It targets the lint errors discussed in the handoff and replaces raw `<img>` tags in the included files with `next/image` using `unoptimized` for user-provided image URLs.

## Apply on Windows

1. Stop the frontend dev server.
2. Extract this ZIP into:
   `C:\Users\Hp\OneDrive\Desktop\P-8\ShebaConnect`
3. Choose **Replace the files in the destination** when Windows asks.
4. Do not replace `.env`, `.env.local`, backend files, or package files. This patch does not contain secrets or dependency files.

## Verify in the frontend terminal

Run these commands one at a time:

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

Do not assume the checks passed until the commands finish successfully. If lint still reports errors or warnings, send the complete terminal output so the remaining locations can be fixed accurately.

## Important scope note

The uploaded review ZIP did not include `package-lock.json`, the full frontend source tree, or backend source. This patch therefore does not claim that the entire project is lint-clean or that the build has been verified here.
