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

1. Install the client dependencies from this repository root:

   ```sh
   npm install
   ```

2. Optionally copy `.env.example` to `.env` to override the local API proxy target.
3. Start the client:

   ```sh
   npm run dev
   ```

The Vite server runs at `http://localhost:5173`. For local API access, run the separate server repository at `http://localhost:5000`; Vite proxies `/api` requests there by default. Set `API_PROXY_TARGET` in `.env` if the server uses another local URL.

The API runs from the separate `server` repository. In that checkout, install dependencies, copy `.env.example` to `.env`, and start the API with `npm run dev`. After setting the admin credentials, create the initial Super Admin there with:

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

Deploy the Express API from the separate `Xyron-Wholesale` server repository. Configure its server environment variables on the API host; never commit real values:

- `NODE_ENV=production`
- `PORT` (provided by the host)
- `CLIENT_ORIGIN=https://xyronwebtech.com` (the exact public frontend origin)
- `JWT_SECRET` (at least 32 random characters)
- `MONGODB_URI`
- `CLOUDINARY_URL`, or all three `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- `XYRON_PIN_DATABASE_PATH` when the PIN database is available on the API host
- `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` for initial setup only

Set `VITE_API_URL` in the Xyron WebTech project at build time to the API host's HTTPS URL ending in `/api` (for example `https://api.example.com/api`). Configure `CLIENT_ORIGIN` on the API to the exact production website origin.

The API host uses its own MongoDB, JWT, Cloudinary, and optional PIN-directory settings. Do not copy these server secrets into the client project.

## Verification

```sh
npm run build
npm run lint
```

The client build produces the portfolio/Wholesale static app. Run `npm test` and `npm run check` in the separate server repository; PIN-directory tests are skipped when the optional database is unavailable.

## Security and source control

- Keep `.env`, production secrets, database files, `node_modules/`, and build output out of Git.
- Use HTTPS for the website and API.
- Set production CORS to the exact public website origin.
- Do not commit credentials or customer data.
