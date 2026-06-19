import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LevelDistributionBar } from '@/components/features/LevelDistributionBar';
import { SalaryTable } from '@/components/features/SalaryTable';
import { config } from '@/lib/config';
import { formatSalary } from '@/lib/format';
import {
  calculateMedian,
  getLevelDistribution,
} from '@/lib/salary-utils';
import {
  fetchAllCompanySlugs,
  fetchCompanyBySlug,
} from '@/lib/queries';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchAllCompanySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await fetchCompanyBySlug(slug);

  if (!company) {
    return { title: 'Company Not Found' };
  }

  const title = `Software Engineer Salaries at ${company.name} — L3 to Principal`;
  const description = `Explore ${company.name} compensation data. ${company.salaries.length} salary records across roles and levels in ${company.headquarters}.`;
  const canonical = `${config.siteUrl}/companies/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await fetchCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const tcValues = company.salaries.map((s) => s.total_compensation);
  const median = calculateMedian(tcValues);
  const minTc = tcValues.length > 0 ? tcValues.reduce((a, b) => (a < b ? a : b)) : BigInt(0);
  const maxTc = tcValues.length > 0 ? tcValues.reduce((a, b) => (a > b ? a : b)) : BigInt(0);
  const primaryCurrency = company.salaries[0]?.currency ?? 'INR';
  const levelDistribution = getLevelDistribution(company.salaries);

  const rows = company.salaries.map((r) => ({
    id: r.id,
    companyName: company.name,
    companySlug: company.slug,
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
    name: `${company.name} Salary Data`,
    description: `Compensation records for ${company.name} on TalentDash.`,
    url: `${config.siteUrl}/companies/${slug}`,
    creator: { '@type': 'Organization', name: 'TalentDash' },
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1>{company.name} Salaries</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-label text-accent">
                {company.industry}
              </span>
              {company.founded_year && (
                <span className="text-metadata text-muted-text">
                  Founded {company.founded_year}
                </span>
              )}
              {company.headcount_range && (
                <span className="text-metadata text-muted-text">
                  {company.headcount_range} employees
                </span>
              )}
              <span className="text-metadata text-muted-text">
                HQ: {company.headquarters}
              </span>
            </div>
          </div>
          <Link
            href={`/compare?c1=${company.slug}`}
            className="inline-flex shrink-0 items-center rounded-lg bg-data-blue px-4 py-2 text-label font-medium text-white transition-opacity hover:opacity-90"
          >
            Compare Salaries
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-label text-muted-text">Median Total Comp</p>
          <p className="mt-1 text-salary text-data-blue">
            {formatSalary(median, primaryCurrency)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-label text-muted-text">TC Range</p>
          <p className="mt-1 text-h3 text-deep-text">
            {formatSalary(minTc, primaryCurrency)} –{' '}
            {formatSalary(maxTc, primaryCurrency)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-label text-muted-text">Total Records</p>
          <p className="mt-1 text-salary text-deep-text">
            {company.salaries.length}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4">Level Distribution</h2>
        <LevelDistributionBar distribution={levelDistribution} />
      </section>

      <section>
        <h2 className="mb-4">All Salary Records</h2>
        <SalaryTable rows={rows} basePath={`/companies/${slug}`} />
      </section>
    </div>
  );
}
