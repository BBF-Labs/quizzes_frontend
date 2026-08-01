This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | The base URL of the backend API (e.g. `https://your-backend.herokuapp.com/api/v1`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes (Phase A) | The public OAuth client ID used by the Google Identity Services script for the in-page consent popup. NOT a secret — register once in Google Cloud Console (see `quizzes_backend/README.md` → "OAuth Setup"). Must match `GOOGLE_CLIENT_ID` in the backend. |
| `NEXT_PUBLIC_SOCKET_URL` | No | Explicit Socket.IO server URL. Defaults to the origin extracted from `NEXT_PUBLIC_API_URL`. Set this if the Socket.IO server is on a different host than the REST API. |
| `NEXT_PUBLIC_SOCKET_PATH` | No | Custom Socket.IO endpoint path. Defaults to `/socket.io`. Set this if the backend mounts Socket.IO at a non-standard path (e.g. `/api/socket.io`). |

OAuth uses the **in-page popup** flow via Google Identity Services (GIS). The
frontend loads `https://accounts.google.com/gsi/client`, calls
`accounts.id.prompt()` to surface Google's consent modal over the page, and
POSTs the resulting `id_token` to `POST /api/v1/auth/oauth/google`. The backend
verifies the `id_token` against Google's JWKS and either logs the user in,
auto-links the provider by email (sending a notification email to the original
account owner), or creates a fresh account. The
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` is the only OAuth value on the frontend; the
client secret (when one is needed) lives only on the backend.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
