import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareView } from '@/components/features/CompareView';
import { config } from '@/lib/config';
import { formatSalary } from '@/lib/format';
import { fetchAllSalariesForCompare } from '@/lib/queries';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Compare Tech Salaries Side by Side',
  description:
    'Compare two salary records from TalentDash. See deltas for base, bonus, stock, and total compensation.',
  alternates: {
    canonical: `${config.siteUrl}/compare`,
  },
  openGraph: {
    title: 'Compare Tech Salaries — TalentDash',
    description:
      'Side-by-side salary comparison with delta calculations for base, bonus, stock, and total comp.',
    url: `${config.siteUrl}/compare`,
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function CompareSkeleton() {
  return (
    <div className="h-[120px] animate-pulse rounded-xl border border-border bg-surface" />
  );
}

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const s1 = typeof params.s1 === 'string' ? params.s1 : undefined;
  const s2 = typeof params.s2 === 'string' ? params.s2 : undefined;

  const salaries = await fetchAllSalariesForCompare();

  const options = salaries.map((s) => ({
    id: s.id,
    label: `${s.company.name} — ${s.role} (${s.level}, ${s.location}) — ${formatSalary(s.total_compensation, s.currency)}`,
    companySlug: s.company.slug,
  }));

  const c1 = typeof params.c1 === 'string' ? params.c1 : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1>Compare Salaries</h1>
        <p className="mt-2 text-body text-body-text">
          Select two salary records to compare compensation side by side with
          delta calculations.
        </p>
      </div>

      <Suspense fallback={<CompareSkeleton />}>
        <CompareView
          options={options}
          initialS1={s1}
          initialS2={s2}
          companySlug={c1}
        />
      </Suspense>
    </div>
  );
}
