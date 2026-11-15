# Xyron WebTech

The Xyron WebTech portfolio and Xyron Wholesale run from one React/Vite site:

- Portfolio: `https://xyronwebtech.com/`
- Wholesale: `https://xyronwebtech.com/wholesale`
- Business storefronts: `https://xyronwebtech.com/wholesale/store/<slug>`

The Wholesale experience is mounted within the portfolio app and uses its own `/wholesale` router base. Do not deploy the Wholesale client as a separate root site when using this integrated setup.

## Requirements

- Node.js 22.12 or later
- MongoDB (local or Atlas)
- A deployed Node.js API service for production
- Cloudinary credentials for image uploads
- The optional PIN directory SQLite database for PIN lookups and checkout

## Local development

1. Copy `.env.example` to `.env`.
2. Set `JWT_SECRET` to a random value of at least 32 characters and configure `MONGODB_URI`.
3. Configure `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` before seeding the initial admin.
4. Install dependencies from this repository root:

   ```sh
   npm install
   ```

5. Start the portfolio site and API together:

   ```sh
   npm run dev:full
   ```

The Vite server runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. Vite proxies local `/api` requests to the API.

Create the initial Super Admin with:

```sh
npm run seed:super-admin
```

## Production deployment

### Web app

Deploy this repository as a Vite static site with:

- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 22.12 or later

The SPA rewrite in `vercel.json` keeps direct navigation and refreshes working for `/wholesale/*` routes. The portfolio remains at `/`; the Wholesale module is served at `/wholesale`.

### API

The `api/[...path].js` Vercel function serves the existing Express API under the same origin at `/api/*`. Configure these server environment variables in Vercel Project Settings; never commit real values:

- `NODE_ENV=production`
- `PORT` (provided by the host)
- `CLIENT_ORIGIN=https://xyronwebtech.com,https://www.xyronwebtech.com` (comma-separated allowed frontend origins)
- `JWT_SECRET` (at least 32 random characters)
- `MONGODB_URI`
- `CLOUDINARY_URL`, or all three `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- `XYRON_PIN_DATABASE_PATH` when the PIN database is available on the API host
- `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` for initial setup only

Leave `VITE_API_URL` empty to use the same-origin `/api` function. If you host the API separately, set `VITE_API_URL` at build time to its HTTPS URL ending in `/api` (for example `https://api.example.com/api`).

The server does not serve the website's static files. The Vercel function uses the same MongoDB, JWT, Cloudinary, and optional PIN-directory settings as the standalone server.

## Verification

```sh
npm run build
npm run test:api
```

The build produces the portfolio/Wholesale static app and checks backend syntax. API tests that require the external PIN database are skipped when that database is unavailable.

## Security and source control

- Keep `.env`, production secrets, database files, `node_modules/`, and build output out of Git.
- Use HTTPS for the website and API.
- Set production CORS to the exact public website origin.
- Do not commit credentials or customer data.
