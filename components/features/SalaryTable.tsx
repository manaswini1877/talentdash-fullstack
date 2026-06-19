import Link from 'next/link';
import type { Currency } from '@prisma/client';
import { LevelBadge } from '@/components/ui/LevelBadge';
import {
  formatExperience,
  formatOptionalAmount,
  formatSalary,
} from '@/lib/format';

export interface SalaryTableRow {
  id: string;
  companyName: string;
  companySlug: string;
  role: string;
  level: string;
  location: string;
  experienceYears: number;
  baseSalary: bigint;
  bonus: bigint;
  stock: bigint;
  totalCompensation: bigint;
  currency: Currency;
}

interface SalaryTableProps {
  rows: SalaryTableRow[];
  sort?: string;
  sortDir?: 'asc' | 'desc';
  basePath?: string;
  showBonus?: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}

function buildSortHref(
  basePath: string,
  currentSort: string | undefined,
  currentDir: 'asc' | 'desc' | undefined,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === 'sort' || key === 'page') return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }
  });

  const nextDir =
    currentSort?.startsWith('total_comp') && currentDir === 'desc'
      ? 'asc'
      : 'desc';
  params.set('sort', nextDir === 'asc' ? 'total_comp_asc' : 'total_comp_desc');
  return `${basePath}?${params.toString()}`;
}

function SortIndicator({
  active,
  dir,
}: {
  active: boolean;
  dir?: 'asc' | 'desc';
}) {
  if (!active) return <span className="ml-1 text-muted-text">↕</span>;
  return (
    <span className="ml-1 text-accent">{dir === 'asc' ? '↑' : '↓'}</span>
  );
}

export function SalaryTable({
  rows,
  sort,
  sortDir = 'desc',
  basePath = '/salaries',
  showBonus = false,
  searchParams = {},
}: SalaryTableProps) {
  const isTotalCompSort = sort?.startsWith('total_comp');

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-app-bg">
          <tr>
            <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
              Company
            </th>
            <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
              Role
            </th>
            <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
              Level
            </th>
            <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
              Location
            </th>
            <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
              Experience
            </th>
            <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
              Base Salary
            </th>
            {showBonus && (
              <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
                Bonus
              </th>
            )}
            <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
              {basePath === '/salaries' ? (
                <Link
                  href={buildSortHref(
                    basePath,
                    sort,
                    sortDir,
                    searchParams,
                  )}
                  className="inline-flex items-center hover:text-deep-text"
                >
                  Total Comp
                  <SortIndicator active={!!isTotalCompSort} dir={sortDir} />
                </Link>
              ) : (
                'Total Comp'
              )}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-hover-surface">
              <td className="max-w-[200px] px-4 py-3">
                <Link
                  href={`/companies/${row.companySlug}`}
                  className="break-words font-medium text-deep-text hover:text-accent"
                >
                  {row.companyName}
                </Link>
              </td>
              <td className="max-w-[180px] break-words px-4 py-3 text-body-text">
                {row.role}
              </td>
              <td className="px-4 py-3">
                <LevelBadge level={row.level} />
              </td>
              <td className="px-4 py-3 text-body-text">{row.location}</td>
              <td className="px-4 py-3 text-body-text">
                {formatExperience(row.experienceYears)}
              </td>
              <td className="px-4 py-3 text-body-text">
                {formatSalary(row.baseSalary, row.currency)}
              </td>
              {showBonus && (
                <td className="px-4 py-3 text-body-text">
                  {formatOptionalAmount(row.bonus, row.currency)}
                </td>
              )}
              <td className="px-4 py-3 text-body-text">
                {formatOptionalAmount(row.stock, row.currency)}
              </td>
              <td className="px-4 py-3">
                <span className="text-[20px] font-bold text-data-blue">
                  {formatSalary(row.totalCompensation, row.currency)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
