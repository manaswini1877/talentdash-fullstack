import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Currency, Level } from '@prisma/client';
import { SalaryFilterBar } from '@/components/features/SalaryFilterBar';
import { SalaryTable } from '@/components/features/SalaryTable';
import { Pagination } from '@/components/ui/Pagination';
import { config } from '@/lib/config';
import { fetchSalaries } from '@/lib/queries';

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const company = typeof params.company === 'string' ? params.company : '';
  const location =
    typeof params.location === 'string' ? params.location : '';

  const title = company
    ? `Software Engineer Salaries at ${company}${location ? ` in ${location}` : ''}`
    : 'Software Engineer Salaries — L3 to Principal';

  const description = company
    ? `Explore ${company} compensation data by role, level, and location on TalentDash.`
    : 'Browse tech salary data from Google, Amazon, Meta, Flipkart, and more. Filter by role, level, location, and currency.';

  const canonicalParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => canonicalParams.append(key, v));
    } else if (value) {
      canonicalParams.set(key, value);
    }
  });
  const canonical = `${config.siteUrl}/salaries${canonicalParams.toString() ? `?${canonicalParams.toString()}` : ''}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

function FilterSkeleton() {
  return (
    <div className="h-[180px] animate-pulse rounded-xl border border-border bg-surface" />
  );
}

export default async function SalariesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const company = typeof params.company === 'string' ? params.company : undefined;
  const role = typeof params.role === 'string' ? params.role : undefined;
  const location =
    typeof params.location === 'string' ? params.location : undefined;
  const currency =
    typeof params.currency === 'string'
      ? (params.currency as Currency)
      : undefined;
  const levels = (Array.isArray(params.level)
    ? params.level
    : params.level
      ? [params.level]
      : []) as Level[];
  const sort =
    typeof params.sort === 'string' ? params.sort : 'total_comp_desc';
  const sortDir = sort === 'total_comp_asc' ? 'asc' : 'desc';
  const page =
    typeof params.page === 'string' ? parseInt(params.page, 10) || 1 : 1;

  const { records, total, limit, totalPages, filterOptions } =
    await fetchSalaries({
      company,
      role,
      location,
      levels: levels.length > 0 ? levels : undefined,
      currency,
      sort: sort as 'total_comp_desc' | 'total_comp_asc' | 'date_desc',
      page,
    });

  const rows = records.map((r) => ({
    id: r.id,
    companyName: r.company.name,
    companySlug: r.company.slug,
    role: r.role,
    level: r.level,
    location: r.location,
    experienceYears: r.experience_years,
    baseSalary: r.base_salary,
    bonus: r.bonus,
    stock: r.stock,
    totalCompensation: r.total_compensation,
    currency: r.currency,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'TalentDash Salary Data',
    description:
      'Tech compensation records contributed by engineers across top companies.',
    url: `${config.siteUrl}/salaries`,
    creator: { '@type': 'Organization', name: 'TalentDash' },
    variableMeasured: ['base salary', 'bonus', 'stock', 'total compensation'],
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <h1>Software Engineer Salaries</h1>
        <p className="mt-2 text-body text-body-text">
          Explore real compensation data from top tech companies. Filter by
          company, role, level, location, and currency.
        </p>
      </div>

      <Suspense fallback={<FilterSkeleton />}>
        <SalaryFilterBar
          roles={filterOptions.roles}
          locations={filterOptions.locations}
        />
      </Suspense>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-body text-body-text">
            No records found for these filters. Try removing a filter.
          </p>
          <Link
            href="/salaries"
            className="mt-4 inline-block text-label text-accent hover:underline"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <>
          <SalaryTable
            rows={rows}
            sort={sort}
            sortDir={sortDir}
            searchParams={params}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
