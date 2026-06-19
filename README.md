# TalentDash — Career Intelligence Platform

> Structured, comparable, decision-ready career data served at internet scale.  
> Built as a full-stack engineering trial task covering schema design, API development, static generation, SEO, and real-time data pipelines.

**Live URL:** [https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)  
**GitHub:** [https://github.com/yourusername/talentdash-fullstack](https://github.com/yourusername/talentdash-fullstack)

---

## What TalentDash Is

TalentDash is a career intelligence platform — not a job board, not a review site. The product is structured, normalised, decision-ready compensation data for professionals in India and globally. Think Levels.fyi for India, with reviews, interview experiences, and a comparison engine built in.

A software engineer in Bengaluru with an Amazon offer for ₹42 LPA can come to TalentDash and find: whether that's a fair L4 offer, what Google pays for the same level, what Amazon's work culture is like, and what the interview rounds looked like — all in one place, all from structured data.

**Core product principle:** Structured data → Comparable → Decision-ready.

---

## Features

### Homepage
- Live stats bar: total records, companies, cities, levels — all from the real database
- Featured companies grid with median TC and record counts per company
- Top paying roles ranked by average total compensation
- Recently added salary records (6 most recent)
- Browse by level: clickable pills with record counts per level
- Popular locations: top 8 cities by record count
- Search bar with quick-filter pills

### Salary Table `/salaries`
- Columns: Company, Role, Level, Location, Experience, Base Salary, Stock, Total Comp
- Level badges color-coded by tier (slate/blue/indigo/purple/navy)
- Total Comp as the visually dominant number in data blue
- Filter bar: company search (debounced 300ms), role dropdown, level multi-select, location dropdown, currency toggle (INR/USD)
- URL-encoded filters — shareable links that pre-fill on load
- Sort by any column, Total Comp descending by default
- Pagination: 25 rows per page with record range display
- Empty state with clear-all filters link
- Indian lakh/crore formatting for INR values

### Company Pages `/companies/[slug]`
- Statically generated at build time from real database slugs
- Company header: name, industry, founding year, headcount, headquarters
- Median TC badge (true statistical median, not average)
- Min–max TC range and total record count
- Horizontal stacked level-distribution bar
- Full salary table filtered to this company
- Compare button pre-filling the first comparison slot

### Compare Page `/compare`
- Select any two salary records from dropdowns
- Side-by-side breakdown of all compensation fields
- Delta column: color-coded green (positive) / red (negative)
- "Higher TC" winner badge in data blue
- Shareable URL state: `/compare?s1={id}&s2={id}`

### API
- `POST /api/ingest-salary` — validated ingestion with normalization and duplicate detection
- `GET /api/salaries` — filtered, sorted, paginated salary data
- `GET /api/companies/[slug]` — company page with median TC and level distribution
- `GET /api/compare` — two-record comparison with delta object

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | React Server Components + generateStaticParams powers the static page engine |
| Language | TypeScript (strict mode) | Type safety across the entire stack, Prisma schema-as-types |
| Styling | Tailwind CSS (hand-written) | Minimal bundle size, full design control, no abstraction overhead |
| ORM | Prisma | Type-safe queries, migration history in source control, schema-as-code |
| Database | PostgreSQL via Neon (serverless) | Structured relational data, excellent full-text search, free tier covers MVP scale |
| Deployment | Vercel | Native Next.js ISR support, global CDN, zero-config deployment |
| Fonts | Inter via next/font/google | Consistent typography, zero layout shift, automatic optimization |

---

## Getting Started

### Prerequisites
- Node.js v20 or higher
- Git
- A Neon account at [neon.tech](https://neon.tech) (free tier is sufficient)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/talentdash-fullstack.git
cd talentdash-fullstack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"
```

Get your `DATABASE_URL` from your Neon project dashboard under Connection Details.

### 4. Run the database migration
```bash
npx prisma migrate dev --name init
```

### 5. Seed the database
```bash
npx prisma db seed
```
This inserts 60+ realistic salary records across Google, Amazon, Meta, Microsoft, Flipkart, Meesho, NVIDIA, TCS, Infosys, Wipro, Razorpay, and Zepto — spanning all levels, multiple cities, and both INR and USD.

### 6. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
Check `/salaries` and `/companies/google` to confirm real database data is rendering.

### 7. Lint check
```bash
npm run lint
```

### 8. Production build
```bash
npm run build
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |

No other environment variables are required for local development or deployment.

---

## Database Schema

### Company
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Display form e.g. "Google India" |
| slug | String (unique) | URL-safe e.g. "google" |
| normalized_name | String (indexed) | Lowercase, trimmed for deduplication |
| industry | String | e.g. "Technology" |
| headquarters | String | City name |
| founded_year | Int? | Nullable |
| headcount_range | String? | e.g. "10,000–50,000" |

### Salary
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| company_id | FK → Company | |
| role | String | Kept exactly as submitted |
| level | Enum | L3, L4, L5, L6, SDE_I, SDE_II, SDE_III, STAFF, PRINCIPAL, IC4, IC5 |
| location | String | City only |
| currency | Enum | INR, USD, GBP, EUR |
| experience_years | Int | 1–50, enforced |
| base_salary | BigInt | Smallest unit (paise/cents) |
| bonus | BigInt | Default 0, never null |
| stock | BigInt | Default 0, never null |
| total_compensation | BigInt | Always computed server-side: base + bonus + stock |
| source | Enum | CONTRIBUTOR, SCRAPED, AI_INFERRED |
| confidence_score | Decimal | 0.0–1.0 |
| is_verified | Boolean | Default false |
| submitted_at | DateTime | Server-set timestamp |

### Indexes
```
@@index([company_id, level, location])  -- primary filter path
@@index([total_compensation])           -- sort path
@@index([submitted_at])                 -- recency sort
@@index([location, level])              -- geo-level filter
```

---

## API Reference

### POST /api/ingest-salary
Ingest a new salary record with full validation and normalization.

**Validation order:**
1. Required fields present
2. Types correct
3. Level is valid enum value
4. experience_years between 1–50
5. base_salary > 0
6. confidence_score between 0.0–1.0

**Normalization:** Company name is lowercased, trimmed, and stripped of punctuation. Company is found-or-created by normalized_name.

**total_compensation is always recomputed server-side:** `base_salary + (bonus ?? 0) + (stock ?? 0)`. Any client-submitted value is stripped.

**Duplicate check:** If same company + role + level + location was submitted in the last 48 hours with base_salary within 10%, returns 409.

```bash
curl -X POST http://localhost:3000/api/ingest-salary \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Google India",
    "role": "Software Engineer",
    "level": "L4",
    "location": "Bengaluru",
    "currency": "INR",
    "experience_years": 4,
    "base_salary": 3500000,
    "bonus": 500000,
    "stock": 1000000,
    "source": "CONTRIBUTOR",
    "confidence_score": 0.9
  }'
```

**Responses:**
- `201 Created` — full stored record with computed total_compensation
- `400 Bad Request` — `{ error: true, field: "level", message: "Level must be one of: L3, L4..." }`
- `409 Conflict` — duplicate record detected within 48 hours

---

### GET /api/salaries
Fetch filtered, sorted, paginated salary records.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| company | string | ILIKE partial match |
| role | string | ILIKE partial match |
| location | string | ILIKE partial match |
| level | enum | Exact match |
| currency | enum | Exact match |
| sort | string | `total_comp_desc` (default), `total_comp_asc`, `date_desc` |
| page | int | Default 1 |
| limit | int | Default 25, hard max 100 |

```bash
curl "http://localhost:3000/api/salaries?company=amazon&level=L4&location=bengaluru&page=1&limit=25"
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 312,
    "page": 1,
    "limit": 25,
    "totalPages": 13
  }
}
```

Cache-Control: `s-maxage=300, stale-while-revalidate=3600`

---

### GET /api/companies/[slug]
Fetch company page data including median TC and level distribution.

```bash
curl "http://localhost:3000/api/companies/google"
```

**Response:**
```json
{
  "company": {
    "id": "...",
    "name": "Google India",
    "slug": "google",
    "industry": "Technology",
    "headquarters": "Bengaluru",
    "founded_year": 1998,
    "headcount_range": "100,000+"
  },
  "salaries": [...],
  "median_total_compensation": 4200000,
  "level_distribution": {
    "L3": 8,
    "L4": 22,
    "L5": 14,
    "L6": 4
  }
}
```

- `404` for unknown slug: `{ error: true, message: "Company not found" }`

Cache-Control: `s-maxage=3600, stale-while-revalidate=86400`

---

### GET /api/compare
Compare two salary records with delta calculations.

```bash
curl "http://localhost:3000/api/compare?s1={uuid1}&s2={uuid2}"
```

**Response:**
```json
{
  "record1": { ... },
  "record2": { ... },
  "delta": {
    "base_delta": 500000,
    "bonus_delta": -100000,
    "stock_delta": 200000,
    "tc_delta": 600000,
    "experience_delta": 2
  }
}
```

Delta = record1 value minus record2 value. Positive = record1 is higher.

- `400` if s1 === s2
- `404` if either ID not found

---

## Architecture Decisions

### Static vs ISR vs Dynamic per page type

| Page | Strategy | Reason |
|---|---|---|
| `/salaries` | ISR (revalidate: 300s) | New records added frequently but not millisecond-critical. 5-minute window balances freshness and CDN efficiency. |
| `/companies/[slug]` | Static + ISR (revalidate: 3600s) | Company metadata rarely changes. Salary data for a company changes less frequently than the global table. 1-hour window is appropriate. |
| `/compare` | ISR (revalidate: 86400s) | Comparison pages cannot all be pre-built. Generated on first request, cached for 24 hours. |
| Homepage | ISR (revalidate: 3600s) | Trending stats and recent records change daily, not by the minute. |
| Admin/ingest | Dynamic (no cache) | Auth-adjacent, data-mutating. Must never be cached. |

`generateStaticParams` is used on `/companies/[slug]` to pre-generate one page per company slug at build time from a live database query — not a hardcoded array. This means adding a new company to the database automatically adds its page on the next deployment.

### Why page-based pagination over cursor-based
Page-based pagination was chosen because TalentDash's primary use case is a browsable salary table, not an infinite scroll feed. Users navigate to page 3 of Amazon L4 results directly — cursor-based pagination cannot support arbitrary page jumps. The dataset size at MVP scale (thousands of records, not billions) does not require the performance benefits cursor pagination provides at extreme scale.

### Why Cache-Control TTLs of 300s and 3600s
- `/api/salaries` at 300s (5 minutes): salary data is the most frequently updated resource. A 5-minute CDN cache means new submissions appear quickly while still offloading the majority of traffic from the database.
- `/api/companies/[slug]` at 3600s (1 hour): company-level aggregates (median TC, level distribution) change only when new records are ingested for that company. An hourly cache is aggressive enough to stay fresh without hammering the DB on every page view.
- `stale-while-revalidate` on both means users never see a loading state — they get the stale cached version instantly while the CDN fetches a fresh copy in the background.

### What I would build differently with another day
- Add Typesense for autocomplete search — PostgreSQL ILIKE is sufficient for MVP but degrades on large datasets
- Add a salary submission form so users can contribute data directly from the UI
- Add the Workplace Index page with composite scoring
- Add the Community/Forum section
- Implement proper ISR cache purging via Cloudflare's cache purge API after each ingest, rather than relying on TTL-based revalidation

### What was NOT built and why
Under 72-hour time pressure, the following were deliberately cut in priority order:

- **Reviews section** (`/reviews`) — the review data model is separate from salary data and would have required additional schema tables, API routes, and UI pages. Cut to keep the core salary intelligence product solid.
- **Interviews section** (`/interviews`) — same reason as reviews.
- **Tools pages** (`/tools/salary-calculator`, etc.) — calculator logic is client-side and could be added quickly, but was deprioritised in favour of the integration layer being correct.
- **Community/Forum** — requires a separate content model and is the lowest SEO-value section at this stage.
- **Auth layer** — explicitly excluded by the trial spec.
- **Typesense search** — PostgreSQL full-text search is sufficient at this data volume.

The salary table, company pages, compare page, full API, and the end-to-end data integration were treated as non-negotiable. Everything else was cut deliberately.

---

## Folder Structure

```
talentdash-fullstack/
├── app/
│   ├── page.tsx                    # Homepage (ISR)
│   ├── layout.tsx                  # Root layout with nav/footer
│   ├── salaries/
│   │   └── page.tsx                # Salary table (ISR RSC)
│   ├── companies/
│   │   └── [slug]/
│   │       └── page.tsx            # Company page (static + ISR)
│   ├── compare/
│   │   └── page.tsx                # Compare page (client component)
│   └── api/
│       ├── ingest-salary/
│       │   └── route.ts            # POST ingestion endpoint
│       ├── salaries/
│       │   └── route.ts            # GET salaries endpoint
│       ├── companies/
│       │   └── [slug]/
│       │       └── route.ts        # GET company endpoint
│       └── compare/
│           └── route.ts            # GET compare endpoint
├── components/
│   ├── ui/                         # Primitive components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Pagination.tsx
│   └── features/                   # Product components
│       ├── SalaryTable.tsx
│       ├── FilterBar.tsx
│       ├── LevelDistributionBar.tsx
│       ├── CompanyCard.tsx
│       └── CompareTable.tsx
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── config.ts                   # Currency rates, constants
│   ├── normalize.ts                # Company name normalization
│   ├── format.ts                   # INR lakh/crore formatting
│   └── median.ts                   # Statistical median utility
├── types/
│   └── index.ts                    # TypeScript interfaces
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── .env
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Competitor Context

TalentDash is built with direct awareness of what exists in the market:

| Product | Their Strength | TalentDash Advantage |
|---|---|---|
| levels.fyi | Gold standard US tech salary data | Virtually no India data. No reviews or interviews. |
| ambitionbox.com | Dominant in India for reviews | Unstructured, un-normalised data. No level system. Outdated UI. |
| glassdoor.co.in | Global brand recognition | Paywalled. Noisy salary data. Algorithm hides negative reviews. |
| teamblind.com | Best anonymous community | Forum-only. No structured data. No SEO. US-focused. |

---

## Data Normalization Examples

The normalization pipeline resolves hundreds of company name variants to a single canonical slug:

| Raw Input | Normalized Slug |
|---|---|
| "Google India Pvt. Ltd." | google |
| "GOOGLE" | google |
| "google " (trailing space) | google |
| "Tata Consultancy Services" | tcs |
| "TCS Ltd." | tcs |
| "amazon.com" | amazon |
| "Flipkart Internet Pvt Ltd" | flipkart |
| "Wipro Technologies" | wipro |

---

## SEO Strategy

Every page is built for organic search:

- Title tags match primary search intent: `"Software Engineer Salaries at Amazon India — L3 to L5 | TalentDash"`
- JSON-LD structured data (schema.org/Dataset) on every salary page for Google rich results
- Canonical URLs to prevent duplicate content penalties
- Open Graph tags for social sharing
- Correct H1 per page matching search intent
- Static generation ensures LCP under 2 seconds on 4G (Lighthouse target)
- Zero client-side JavaScript on the salary table page by default

---

## Hardest Decision Made

The hardest decision was the integration layer for `generateStaticParams` on `/companies/[slug]`. The temptation was to hardcode a list of known company slugs to avoid the complexity of a live database query at build time. I chose instead to do a real Prisma query inside `generateStaticParams`, which means the build connects to Neon, fetches all company slugs, and pre-generates one static page per company. This adds a build-time dependency on the database but it means adding a new company to the database automatically adds its static page on the next deployment — no code change required. That is the correct architecture for a product that will eventually have thousands of company pages.

---

## License

Built as a trial task for TalentDash. Not for redistribution.
