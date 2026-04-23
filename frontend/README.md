# Ebella — Frontend

React + Vite + TypeScript SPA for the Furniture Catalog website. Contains both
the **public site** and the **admin panel**, sharing a single design system.

## Stack

- React 18 + Vite 5 + TypeScript
- React Router v6 (browser router)
- TanStack Query v5 for data
- Axios (single shared instance, auth + refresh interceptors)
- Zustand (persisted auth store)
- React Hook Form + Zod
- Tailwind CSS v3 with CSS-variable design tokens
- lucide-react icons

## Folder structure

```
src/
├── api/          # Axios client, endpoint map, per-domain api funcs
├── app/          # Root App, providers, stores
├── components/
│   ├── ui/       # Primitives: Button, Input, Card, Badge, Modal, Table,
│   │             #             FormSection, ImageUploader, Skeleton,
│   │             #             EmptyState, ErrorState, Spinner, Container
│   └── common/   # Logo and other brand pieces
├── features/     # Feature-scoped components (add as needed)
├── hooks/        # useAuth, useCatalog (queries), ...
├── layouts/      # PublicLayout, AdminLayout, AuthLayout
├── pages/
│   ├── public/   # Home, Category, Product, About, Contact, 404
│   └── admin/    # Login, Dashboard, Categories, Products, Media,
│                 # Content, Settings, ProductEdit
├── routes/       # Route table + guards
├── types/        # API wire types mirroring the backend DTOs
├── utils/        # cn, env, format
└── styles/
    └── globals.css   # Tailwind layers + design tokens
```

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. The SPA talks to `VITE_API_BASE_URL`
(default `http://localhost:8080/api/v1`).

## Environment

| Var | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend REST base | `http://localhost:8080/api/v1` |
| `VITE_PUBLIC_SITE_URL` | Used by admin panel links back to the live site | `http://localhost:5173` |
| `VITE_DEV_PROXY_TARGET` | If set, Vite proxies `/api` and `/media` to this origin | — |

## Scripts

- `npm run dev` – Vite dev server
- `npm run build` – type-check + production build
- `npm run preview` – serve the production build locally
- `npm run typecheck` – `tsc --noEmit`
- `npm run lint` / `npm run format`

## Design direction

Premium minimalist furniture-brand aesthetic:

- Warm off-white surface, near-black ink, muted walnut accent.
- Fraunces (display) paired with Inter (body) via Google Fonts.
- Generous whitespace, restrained borders, subtle `lift` hover on interactive
  surfaces, focus-visible rings for keyboard a11y.
- All colors are RGB triplets in CSS variables (`--color-*`) so `text-fg/70`
  alpha works and a future dark mode is a single `[data-theme="dark"]` hook.

## Data flow

- All reads/writes go through the Axios instance in `src/api/client.ts`.
- TanStack Query owns caching, retries, and loading states.
- Auth state (tokens + profile) lives in `useAuthStore` (persisted).
  The Axios response interceptor auto-refreshes the access token once on a
  401 and retries the original request.
- Protected admin routes sit under `RequireAdmin` in `src/routes/guards.tsx`.

## Conventions

- **Pages** compose layout + feature components. They own data fetching.
- **Features** are domain-scoped components reused across pages.
- **UI primitives** stay presentation-only and accept `className` overrides.
- **Types** mirror backend DTOs in one file (`src/types/api.ts`). Keep in
  sync with the Spring DTOs or regenerate from OpenAPI in a follow-up.
- No CSS-in-JS: Tailwind utilities + component-local CSS only.

## Next milestones

1. Wire up admin CRUD screens against the existing services.
2. Add a thin `features/catalog` layer (`ProductCard`, `ImageGallery`,
   `ColorSwatchPicker`) and lift the product page composition.
3. Generate `src/types/api.ts` from the backend OpenAPI spec in CI.
4. Swap localStorage refresh-token storage for an httpOnly cookie once the
   backend adds `/admin/auth/logout` + cookie handling.
