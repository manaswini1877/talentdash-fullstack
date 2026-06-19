# TalentDash — Full-Stack Trial Task

## 1. Project Overview

TalentDash is a tech salary transparency platform that helps software engineers explore, filter, and compare real compensation data across companies. This project implements the full-stack trial task: a PostgreSQL-backed Next.js application with Prisma ORM, REST API endpoints for salary ingestion and querying, and server-rendered pages for browsing salaries, viewing company profiles, and comparing offers side by side.

**Assumptions made:**
- Site URL defaults to `http://localhost:3000` via `NEXT_PUBLIC_SITE_URL` (override for production).
- Company logos are not included — no public logo URLs were provided; pages use text-based company headers.
- Compare deltas use raw subunit values (paise/cents); both records are assumed to share currency for meaningful delta display.
- New companies created via ingest receive default industry `"Technology"` and headquarters set to the submitted location.
- GBP/EUR seed records store amounts in pence/cents subunits (same BigInt pattern as USD).

## 2. Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Neon PG    │────▶│  Prisma ORM  │────▶│  lib/queries    │────▶│  RSC Pages   │
│  Database   │     │  (lib/prisma)│     │  + API Routes   │     │  (HTML SSR)  │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────────┘
                            │                      │
                            │                      ▼
                            │              ┌─────────────────┐
                            └─────────────▶│  Client Islands │
                                           │  (filters,      │
                                           │   compare UI)   │
                                           └─────────────────┘
```

**Data flow:**
1. Salary records are stored in Neon PostgreSQL via Prisma.
2. Server Components query the database directly through `lib/queries.ts` (no mock data).
3. API routes (`/api/*`) expose the same data for programmatic access and the compare client component.
4. POST `/api/ingest-salary` writes new records and triggers ISR revalidation via `revalidatePath`.
5. Filter bar and compare page are client components that sync state to URL query params for shareable links.

## 3. Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | Full-stack React framework with RSC, ISR, and API routes |
| **TypeScript (strict)** | Type safety across frontend, backend, and Prisma |
| **Tailwind CSS** | Utility-first styling — all components hand-written, no UI libraries |
| **Prisma ORM** | Type-safe database access, migrations, and seeding |
| **Neon PostgreSQL** | Serverless Postgres for production-grade storage |
| **ESLint + Prettier** | Code quality and consistent formatting |
| **tsx** | TypeScript execution for Prisma seed script |

## 4. Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Access to the Neon PostgreSQL database (`.env` provided)

### Clone the repo

```bash
git clone <repo-url>
cd talentdash-fullstack
```

### Install dependencies

```bash
npm install
```

### Set up `.env`

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://neondb_owner:npg_ArQuyk9EKXg8@ep-polished-night-aobopxf1-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | See above |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO metadata | `http://localhost:3000` |

### Run migration

```bash
npx prisma migrate dev
```

### Run seed

```bash
npx prisma db seed
```

Seeds 12 companies and 64+ salary records spanning all levels, currencies, and edge cases.

### Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Live URL

[paste Vercel URL here]

## 6. API Documentation

### POST `/api/ingest-salary`

Ingest a new salary record with validation, normalization, duplicate detection, and ISR revalidation.

**Request body:**

```json
{
  "company_name": "Google India",
  "role": "Software Engineer",
  "level": "L4",
  "location": "Bengaluru",
  "currency": "INR",
  "experience_years": 4,
  "base_salary": 420000000,
  "bonus": 60000000,
  "stock": 120000000,
  "source": "CONTRIBUTOR",
  "confidence_score": 0.92
}
```

**Success (201):** Full stored record with computed `total_compensation`.

**Errors:**
- `400` — Validation failure: `{ error: true, field: "level", message: "..." }`
- `409` — Duplicate within 48 hours with similar base salary

---

### GET `/api/salaries`

List salary records with filtering, sorting, and pagination.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `company` | string | Partial match (ILIKE) on company name |
| `role` | string | Partial match (ILIKE) on role |
| `location` | string | Partial match (ILIKE) on location |
| `level` | enum | Exact level match |
| `currency` | enum | Exact currency match |
| `sort` | string | `total_comp_desc` (default), `total_comp_asc`, `date_desc` |
| `page` | int | Page number (default 1) |
| `limit` | int | Page size (default 25, max 100) |

**Response:**

```json
{
  "data": [{ "id": "...", "total_compensation": "600000000", "company": { "name": "Google India", "slug": "google" }, "...": "..." }],
  "meta": { "total": 64, "page": 1, "limit": 25, "totalPages": 3 }
}
```

**Headers:** `Cache-Control: s-maxage=300, stale-while-revalidate=3600`

---

### GET `/api/companies/[slug]`

Company profile with salaries, median TC, and level distribution.

**Response:**

```json
{
  "company": { "name": "Google India", "slug": "google", "industry": "Technology", "...": "..." },
  "salaries": [...],
  "median_total_compensation": "580000000",
  "level_distribution": { "L3": 4, "L4": 3, "L5": 2 }
}
```

**404:** `{ error: true, message: "Company not found" }`

**Headers:** `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`

---

### GET `/api/compare`

Compare two salary records by UUID.

**Query params:** `s1` (UUID), `s2` (UUID)

**Response:**

```json
{
  "record1": { "...": "..." },
  "record2": { "...": "..." },
  "delta": {
    "base_delta": 140000000,
    "bonus_delta": 20000000,
    "stock_delta": 60000000,
    "tc_delta": 220000000,
    "experience_delta": 2
  }
}
```

**Errors:** `400` if s1 === s2; `404` if either ID not found.

## 7. Architecture Decisions

### Static vs ISR vs Dynamic

| Page | Strategy | Revalidate | Rationale |
|---|---|---|---|
| `/` (homepage) | ISR | 3600s | Marketing content changes infrequently |
| `/salaries` | ISR | 300s | Data updates via ingest; 5-min window balances freshness and CDN cache hits |
| `/companies/[slug]` | ISR + SSG | 3600s | Company profiles are stable; `generateStaticParams()` pre-renders all slugs at build |
| `/compare` | ISR shell + client | 86400s | Dropdown options cached daily; comparison logic runs client-side via API |
| API routes | CDN cache headers | 300s / 3600s | `Cache-Control` headers enable edge caching on Vercel/Cloudflare |

### Page-based pagination vs cursor-based

**Chosen: page-based pagination.**

With 64 seed records (scaling to ~10K), offset pagination is simple, supports direct URL links (`?page=3`), and works with the existing Prisma indexes on `total_compensation` and `submitted_at`. Cursor-based pagination would be preferable beyond ~100K rows where offset skips become expensive.

### Cache-Control TTL choices

- **300s for `/api/salaries`:** Salary list is the most frequently updated view (new ingest submissions). A 5-minute stale window keeps data reasonably fresh while allowing CDN hits.
- **3600s for `/api/companies/[slug]`:** Company aggregates (median, distribution) change slowly. Hourly revalidation reduces database load for repeated company page visits.

### What I would build differently with another day

- Add authentication for salary submission to prevent spam ingest.
- Implement currency-normalized compare (convert both records to a common currency before delta).
- Add integration tests for the validation pipeline and API endpoints.
- Add a salary submission form UI wired to `/api/ingest-salary`.
- Use React Server Actions as an alternative to the REST ingest endpoint.

### What was NOT built and why

- **Company logos:** No logo asset URLs or CDN were specified; text headers used instead.
- **Auth / user accounts:** Out of scope for the trial task.
- **Salary charts / analytics dashboard:** Spec focused on table views, compare, and company profiles.
- **Search results page:** Not requested; filtering on `/salaries` covers the use case.
- **Rate limiting on ingest:** Would require middleware infrastructure not specified in the stack.
- **Webhook notifications:** No requirement for real-time alerts on new submissions.

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run format       # Prettier format
npx prisma studio    # Database GUI
```

## Folder Structure

```
app/                    # Next.js App Router pages and API routes
components/
  ui/                   # Reusable UI primitives (badges, pagination, header)
  features/             # Feature components (table, filters, compare, distribution)
lib/                    # Prisma client, queries, formatting, config
types/                  # Shared TypeScript interfaces
prisma/                 # Schema, migrations, seed
```
#   t a l e n t d a s h - f u l l s t a c k  
 