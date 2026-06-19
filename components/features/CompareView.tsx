'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LevelBadge } from '@/components/ui/LevelBadge';
import {
  formatExperience,
  formatOptionalAmount,
  formatSalary,
  formatSalaryDelta,
} from '@/lib/format';
import type { SerializedSalary } from '@/types/salary';

interface CompareOption {
  id: string;
  label: string;
  companySlug: string;
}

interface CompareViewProps {
  options: CompareOption[];
  initialS1?: string;
  initialS2?: string;
  companySlug?: string;
}

interface CompareData {
  record1: SerializedSalary;
  record2: SerializedSalary;
  delta: {
    base_delta: number;
    bonus_delta: number;
    stock_delta: number;
    tc_delta: number;
    experience_delta: number;
  };
}

function DeltaCell({
  delta,
  currency,
}: {
  delta: number;
  currency: SerializedSalary['currency'];
}) {
  if (delta === 0) {
    return <span className="text-muted-text">—</span>;
  }

  const color = delta > 0 ? 'text-success' : 'text-error';
  return (
    <span className={`font-medium ${color}`}>
      {formatSalaryDelta(delta, currency)}
    </span>
  );
}

export function CompareView({
  options,
  initialS1,
  initialS2,
  companySlug,
}: CompareViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filteredOptions = useMemo(() => {
    if (!companySlug) return options;
    return options.filter((opt) => opt.companySlug === companySlug);
  }, [options, companySlug]);

  const [s1, setS1] = useState(initialS1 ?? '');
  const [s2, setS2] = useState(initialS2 ?? '');
  const [data, setData] = useState<CompareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateUrl = useCallback(
    (id1: string, id2: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id1) params.set('s1', id1);
      else params.delete('s1');
      if (id2) params.set('s2', id2);
      else params.delete('s2');
      router.replace(`/compare?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (!s1 || !s2) {
      setData(null);
      setError(null);
      return;
    }

    if (s1 === s2) {
      setData(null);
      setError('Cannot compare a salary record with itself.');
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/compare?s1=${s1}&s2=${s2}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message ?? 'Comparison failed');
        }
        setData(json);
      })
      .catch((err: Error) => {
        setData(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [s1, s2]);

  const winner = useMemo(() => {
    if (!data) return null;
    const tc1 = BigInt(data.record1.total_compensation);
    const tc2 = BigInt(data.record2.total_compensation);
    if (tc1 > tc2) return 1;
    if (tc2 > tc1) return 2;
    return null;
  }, [data]);

  const rows = data
    ? [
        {
          label: 'Company',
          v1: data.record1.company?.name ?? '—',
          v2: data.record2.company?.name ?? '—',
          delta: null as number | null,
        },
        {
          label: 'Role',
          v1: data.record1.role,
          v2: data.record2.role,
          delta: null,
        },
        {
          label: 'Level',
          v1: data.record1.level,
          v2: data.record2.level,
          delta: null,
          isLevel: true,
        },
        {
          label: 'Location',
          v1: data.record1.location,
          v2: data.record2.location,
          delta: null,
        },
        {
          label: 'Experience',
          v1: formatExperience(data.record1.experience_years),
          v2: formatExperience(data.record2.experience_years),
          delta: data.delta.experience_delta,
          isExperience: true,
        },
        {
          label: 'Base',
          v1: formatSalary(data.record1.base_salary, data.record1.currency),
          v2: formatSalary(data.record2.base_salary, data.record2.currency),
          delta: data.delta.base_delta,
        },
        {
          label: 'Bonus',
          v1: formatOptionalAmount(data.record1.bonus, data.record1.currency),
          v2: formatOptionalAmount(data.record2.bonus, data.record2.currency),
          delta: data.delta.bonus_delta,
        },
        {
          label: 'Stock',
          v1: formatOptionalAmount(data.record1.stock, data.record1.currency),
          v2: formatOptionalAmount(data.record2.stock, data.record2.currency),
          delta: data.delta.stock_delta,
        },
        {
          label: 'Total Comp',
          v1: formatSalary(
            data.record1.total_compensation,
            data.record1.currency,
          ),
          v2: formatSalary(
            data.record2.total_compensation,
            data.record2.currency,
          ),
          delta: data.delta.tc_delta,
          isTc: true,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="compare-s1"
            className="mb-1 block text-label text-muted-text"
          >
            Record 1
          </label>
          <select
            id="compare-s1"
            value={s1}
            onChange={(e) => {
              setS1(e.target.value);
              updateUrl(e.target.value, s2);
            }}
            className="w-full rounded-lg border border-border px-3 py-2 text-body text-deep-text outline-none focus:border-accent"
          >
            <option value="">Select a record...</option>
            {filteredOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="compare-s2"
            className="mb-1 block text-label text-muted-text"
          >
            Record 2
          </label>
          <select
            id="compare-s2"
            value={s2}
            onChange={(e) => {
              setS2(e.target.value);
              updateUrl(s1, e.target.value);
            }}
            className="w-full rounded-lg border border-border px-3 py-2 text-body text-deep-text outline-none focus:border-accent"
          >
            <option value="">Select a record...</option>
            {filteredOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="h-64 animate-pulse rounded-xl border border-border bg-surface" />
      )}

      {error && !loading && (
        <div className="rounded-xl border border-error/30 bg-error/5 p-4 text-body text-error">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-app-bg">
              <tr>
                <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
                  Field
                </th>
                <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
                  Record 1
                  {winner === 1 && (
                    <span className="ml-2 rounded-full bg-data-blue/10 px-2 py-0.5 text-metadata text-data-blue">
                      Higher TC
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
                  Record 2
                  {winner === 2 && (
                    <span className="ml-2 rounded-full bg-data-blue/10 px-2 py-0.5 text-metadata text-data-blue">
                      Higher TC
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-label font-medium text-muted-text">
                  Delta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-hover-surface">
                  <td className="px-4 py-3 font-medium text-deep-text">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-body-text">
                    {'isLevel' in row && row.isLevel ? (
                      <LevelBadge level={row.v1 as string} />
                    ) : 'isTc' in row && row.isTc ? (
                      <span className="text-[20px] font-bold text-data-blue">
                        {row.v1}
                      </span>
                    ) : (
                      row.v1
                    )}
                  </td>
                  <td className="px-4 py-3 text-body-text">
                    {'isLevel' in row && row.isLevel ? (
                      <LevelBadge level={row.v2 as string} />
                    ) : 'isTc' in row && row.isTc ? (
                      <span className="text-[20px] font-bold text-data-blue">
                        {row.v2}
                      </span>
                    ) : (
                      row.v2
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.delta !== null ? (
                      'isExperience' in row && row.isExperience ? (
                        row.delta === 0 ? (
                          <span className="text-muted-text">—</span>
                        ) : (
                          <span
                            className={
                              row.delta > 0 ? 'text-success' : 'text-error'
                            }
                          >
                            {row.delta > 0 ? '+' : ''}
                            {row.delta} yr{Math.abs(row.delta) === 1 ? '' : 's'}
                          </span>
                        )
                      ) : (
                        <DeltaCell
                          delta={row.delta}
                          currency={data.record1.currency}
                        />
                      )
                    ) : (
                      <span className="text-muted-text">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
