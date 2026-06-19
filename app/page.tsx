import type { Metadata } from 'next';
import Link from 'next/link';
import { config } from '@/lib/config';
import prisma from '@/lib/prisma';
import { formatSalary, formatExperience, formatLevelLabel } from '@/lib/format';
import { getLevelBadgeClass } from '@/lib/level-colors';
import { calculateMedian } from '@/lib/salary-utils';
import { HeroSearch } from '@/components/features/HeroSearch';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Tech Salary Transparency Platform',
  description:
    'TalentDash helps software engineers explore and compare real compensation data from top tech companies in India and globally.',
  alternates: {
    canonical: `${config.siteUrl}/`,
  },
  openGraph: {
    title: 'TalentDash — Tech Salary Transparency Platform',
    description:
      'Explore verified tech salary data across top companies in India and globally.',
    url: `${config.siteUrl}/`,
  },
};

const USD_RATE = 83;
const GBP_RATE = 105;
const EUR_RATE = 90;

function convertToInrSubunits(amount: bigint, currency: string): bigint {
  const amt = Number(amount);
  if (currency === 'USD') return BigInt(Math.round(amt * USD_RATE));
  if (currency === 'GBP') return BigInt(Math.round(amt * GBP_RATE));
  if (currency === 'EUR') return BigInt(Math.round(amt * EUR_RATE));
  return amount; // INR
}

const LEVEL_RANKS: Record<string, number> = {
  L3: 1,
  SDE_I: 1,
  L4: 2,
  SDE_II: 2,
  L5: 3,
  SDE_III: 3,
  L6: 4,
  IC4: 4,
  STAFF: 4,
  IC5: 5,
  PRINCIPAL: 6,
};

export default async function HomePage() {
  // Fetch stats
  const [totalSalaries, totalCompanies, distinctLocations] = await Promise.all([
    prisma.salary.count(),
    prisma.company.count(),
    prisma.salary.findMany({
      select: { location: true },
      distinct: ['location'],
    }),
  ]);
  const totalCities = distinctLocations.length;
  const levelsTracked = 11;

  // Fetch featured companies
  const companiesData = await prisma.company.findMany({
    include: {
      salaries: {
        select: {
          total_compensation: true,
          currency: true,
        },
      },
    },
  });

  const featuredCompanies = companiesData.map((company) => {
    const salariesCount = company.salaries.length;
    const tcValues = company.salaries.map((s) => s.total_compensation);
    const median = calculateMedian(tcValues);
    const primaryCurrency = company.salaries[0]?.currency ?? 'INR';
    
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      industry: company.industry,
      salariesCount,
      medianTC: median,
      primaryCurrency,
    };
  });

  // Fetch top paying roles
  const salariesForRoles = await prisma.salary.findMany({
    select: {
      role: true,
      level: true,
      total_compensation: true,
      currency: true,
    },
  });

  const roleMap: Record<
    string,
    { role: string; totalInr: bigint; count: number; levels: string[] }
  > = {};
  for (const s of salariesForRoles) {
    const inrValue = convertToInrSubunits(s.total_compensation, s.currency);
    if (!roleMap[s.role]) {
      roleMap[s.role] = { role: s.role, totalInr: BigInt(0), count: 0, levels: [] };
    }
    roleMap[s.role].totalInr += inrValue;
    roleMap[s.role].count += 1;
    roleMap[s.role].levels.push(s.level);
  }

  const processedRoles = Object.values(roleMap).map((r) => {
    const avgTC = Number(r.totalInr / BigInt(r.count));
    const uniqueLevels = [...new Set(r.levels)];
    const sortedLevels = uniqueLevels.sort(
      (a, b) => (LEVEL_RANKS[a] ?? 0) - (LEVEL_RANKS[b] ?? 0),
    );
    const minL = sortedLevels[0] || '';
    const maxL = sortedLevels[sortedLevels.length - 1] || '';
    
    let levelRange = '';
    if (minL && maxL) {
      const formattedMin = formatLevelLabel(minL);
      const formattedMax = formatLevelLabel(maxL);
      levelRange =
        formattedMin === formattedMax ? formattedMin : `${formattedMin} – ${formattedMax}`;
    }

    return {
      role: r.role,
      avgTC,
      levelRange,
    };
  });

  processedRoles.sort((a, b) => b.avgTC - a.avgTC);
  const topRoles = processedRoles.slice(0, 6);
  const maxRoleAvgTC = topRoles.length > 0 ? topRoles[0].avgTC : 1;

  // Fetch recent salaries
  const recentSalaries = await prisma.salary.findMany({
    orderBy: {
      submitted_at: 'desc',
    },
    take: 6,
    include: {
      company: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  // Fetch explore by level counts
  const levelCounts = await prisma.salary.groupBy({
    by: ['level'],
    _count: {
      id: true,
    },
  });

  const levelCountMap: Record<string, number> = {};
  for (const item of levelCounts) {
    levelCountMap[item.level] = item._count.id;
  }

  const levelsToExplore = [
    { label: 'L3', dbValue: 'L3' },
    { label: 'L4', dbValue: 'L4' },
    { label: 'L5', dbValue: 'L5' },
    { label: 'L6', dbValue: 'L6' },
    { label: 'SDE-I', dbValue: 'SDE_I' },
    { label: 'SDE-II', dbValue: 'SDE_II' },
    { label: 'SDE-III', dbValue: 'SDE_III' },
    { label: 'Staff', dbValue: 'STAFF' },
    { label: 'Principal', dbValue: 'PRINCIPAL' },
  ];

  // Fetch popular cities
  const cityCounts = await prisma.salary.groupBy({
    by: ['location'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 8,
  });

  const popularCities = cityCounts.map((c) => ({
    location: c.location,
    count: c._count.id,
  }));

  return (
    <div className="space-y-12">
      {/* HERO SECTION */}
      <section className="rounded-2xl bg-surface p-8 shadow-sm md:p-12">
        <h1 className="max-w-2xl text-deep-text font-bold">
          Know your worth. Compare tech salaries with confidence.
        </h1>
        <p className="mt-4 max-w-xl text-body text-body-text">
          TalentDash aggregates real compensation data from contributors across
          Google, Amazon, Meta, Flipkart, and more — broken down by role,
          level, and location.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/salaries"
            className="rounded-lg bg-accent px-6 py-3 text-label font-medium text-white transition-opacity hover:opacity-90"
          >
            Browse Salaries
          </Link>
          <Link
            href="/compare"
            className="rounded-lg border border-border bg-surface px-6 py-3 text-label font-medium text-deep-text transition-colors hover:bg-hover-surface"
          >
            Compare Offers
          </Link>
        </div>
        
        {/* NEW HERO SEARCH */}
        <HeroSearch />
      </section>

      {/* SECTION 1 — STATS BAR */}
      <section className="bg-surface border-b border-border p-6 rounded-2xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="text-[32px] md:text-[40px] font-bold text-accent leading-none">
            {totalSalaries.toLocaleString()}
          </span>
          <span className="mt-2 text-metadata md:text-label text-muted-text font-semibold uppercase tracking-wider">
            Salary Records
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[32px] md:text-[40px] font-bold text-accent leading-none">
            {totalCompanies.toLocaleString()}
          </span>
          <span className="mt-2 text-metadata md:text-label text-muted-text font-semibold uppercase tracking-wider">
            Companies Covered
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[32px] md:text-[40px] font-bold text-accent leading-none">
            {totalCities.toLocaleString()}
          </span>
          <span className="mt-2 text-metadata md:text-label text-muted-text font-semibold uppercase tracking-wider">
            Cities Covered
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[32px] md:text-[40px] font-bold text-accent leading-none">
            {levelsTracked}
          </span>
          <span className="mt-2 text-metadata md:text-label text-muted-text font-semibold uppercase tracking-wider">
            Levels Tracked
          </span>
        </div>
      </section>

      {/* SECTION 2 — FEATURED COMPANIES GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 font-bold text-deep-text">Explore by Company</h2>
            <p className="mt-1 text-muted-text text-body">
              Browse compensation data across top tech and product companies
            </p>
          </div>
          <Link href="/salaries" className="text-accent font-medium hover:underline text-label sm:text-body shrink-0">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="bg-surface border border-border rounded-xl p-5 hover:border-accent hover:shadow-md transition-all duration-200 flex items-center justify-between group"
            >
              <div className="space-y-2 flex-1 min-w-0 pr-2">
                <div className="flex flex-col gap-1.5 items-start">
                  <span className="font-bold text-deep-text text-[16px] group-hover:text-accent transition-colors truncate w-full">
                    {company.name}
                  </span>
                  <span className="bg-app-bg text-muted-text text-[11px] px-2 py-0.5 rounded-full font-medium truncate max-w-full">
                    {company.industry}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-text text-label">
                    {company.salariesCount} {company.salariesCount === 1 ? 'record' : 'records'}
                  </span>
                  <span className="text-data-blue font-bold mt-1 text-label sm:text-body">
                    {formatSalary(company.medianTC, company.primaryCurrency)} median
                  </span>
                </div>
              </div>
              <div className="text-muted-text group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3 — TOP PAYING ROLES */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-bold text-deep-text">Highest Paying Roles Right Now</h2>
          <Link href="/salaries?sort=total_comp_desc" className="text-accent font-medium hover:underline text-label sm:text-body shrink-0">
            View all &rarr;
          </Link>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden divide-y divide-border shadow-sm">
          {topRoles.map((roleInfo) => {
            const percentage = maxRoleAvgTC > 0 ? (roleInfo.avgTC / maxRoleAvgTC) * 100 : 0;
            return (
              <Link
                key={roleInfo.role}
                href={`/salaries?role=${encodeURIComponent(roleInfo.role)}`}
                className="relative flex items-center justify-between p-4 hover:bg-hover-surface transition-colors group block"
              >
                {/* Progress Bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-[#0369A1]/5 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-1 items-center justify-between gap-4">
                  <span className="font-bold text-deep-text group-hover:text-accent transition-colors flex-1 truncate">
                    {roleInfo.role}
                  </span>
                  <span className="text-muted-text text-label px-2 md:px-4 shrink-0">
                    {roleInfo.levelRange || '—'}
                  </span>
                  <span className="font-bold text-data-blue shrink-0">
                    {formatSalary(BigInt(Math.round(roleInfo.avgTC)), 'INR')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 4 — RECENT SALARY RECORDS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-bold text-deep-text">Recently Added Salaries</h2>
          <Link href="/salaries?sort=date_desc" className="text-accent font-medium hover:underline text-label sm:text-body shrink-0">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentSalaries.map((record) => {
            const badgeClass = getLevelBadgeClass(record.level);
            return (
              <div
                key={record.id}
                className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/companies/${record.company.slug}`}
                      className="font-bold text-deep-text hover:text-accent transition-colors truncate"
                    >
                      {record.company.name}
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${badgeClass}`}>
                      {formatLevelLabel(record.level)}
                    </span>
                  </div>
                  <p className="text-body-text mt-2 font-medium truncate">{record.role}</p>
                  <p className="text-muted-text text-label mt-1">
                    {record.location} · {formatExperience(record.experience_years)}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-end gap-2">
                    <div>
                      <p className="text-[32px] font-bold text-data-blue leading-none">
                        {formatSalary(record.total_compensation, record.currency)}
                      </p>
                      <p className="text-muted-text text-metadata mt-2">
                        Base: {formatSalary(record.base_salary, record.currency)} · Stock: {formatSalary(record.stock, record.currency)}
                      </p>
                    </div>
                    <span className="bg-app-bg text-muted-text px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0 mb-1">
                      {record.source}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5 — EXPLORE BY LEVEL */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-bold text-deep-text">Browse by Level</h2>
          <Link href="/salaries" className="text-accent font-medium hover:underline text-label sm:text-body shrink-0">
            View all &rarr;
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {levelsToExplore.map((level) => {
            const count = levelCountMap[level.dbValue] ?? 0;
            return (
              <Link
                key={level.dbValue}
                href={`/salaries?level=${level.dbValue}`}
                className="bg-app-bg border border-border text-body-text px-4 py-2 rounded-full font-medium transition-all hover:bg-accent hover:text-white"
              >
                {level.label} ({count})
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 6 — EXPLORE BY CITY */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-bold text-deep-text">Popular Locations</h2>
          <Link href="/salaries" className="text-accent font-medium hover:underline text-label sm:text-body shrink-0">
            View all &rarr;
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin">
          {popularCities.map((cityData) => (
            <Link
              key={cityData.location}
              href={`/salaries?location=${encodeURIComponent(cityData.location)}`}
              className="bg-surface rounded-xl border border-border p-4 min-w-[140px] flex-1 sm:flex-initial transition-all hover:border-accent hover:shadow-sm flex flex-col justify-center group"
            >
              <span className="font-bold text-deep-text group-hover:text-accent transition-colors truncate">
                {cityData.location}
              </span>
              <span className="text-muted-text text-label mt-1 shrink-0">
                {cityData.count} {cityData.count === 1 ? 'salary' : 'salaries'}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
