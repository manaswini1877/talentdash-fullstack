'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LEVELS } from '@/lib/config';
import { formatLevelLabel } from '@/lib/format';

interface SalaryFilterBarProps {
  roles: string[];
  locations: string[];
}

export function SalaryFilterBar({ roles, locations }: SalaryFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const initialCompany = searchParams.get('company') ?? '';
  const initialRole = searchParams.get('role') ?? '';
  const initialLocation = searchParams.get('location') ?? '';
  const initialCurrency = searchParams.get('currency') ?? '';
  const initialLevels = searchParams.getAll('level');

  const [company, setCompany] = useState(initialCompany);
  const [debouncedCompany, setDebouncedCompany] = useState(initialCompany);

  useEffect(() => {
    setCompany(initialCompany);
    setDebouncedCompany(initialCompany);
  }, [initialCompany]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCompany(company), 300);
    return () => clearTimeout(timer);
  }, [company]);

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);
        if (value === null || value === '') return;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      params.delete('page');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams, startTransition],
  );

  useEffect(() => {
    if (debouncedCompany !== initialCompany) {
      updateParams({ company: debouncedCompany || null });
    }
  }, [debouncedCompany, initialCompany, updateParams]);

  const selectedLevels = useMemo(
    () => new Set(initialLevels),
    [initialLevels],
  );

  const toggleLevel = (level: string) => {
    const next = new Set(selectedLevels);
    if (next.has(level)) {
      next.delete(level);
    } else {
      next.add(level);
    }
    updateParams({ level: next.size > 0 ? Array.from(next) : null });
  };

  const clearAll = () => {
    setCompany('');
    setDebouncedCompany('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="company-search"
            className="mb-1 block text-label text-muted-text"
          >
            Company
          </label>
          <input
            id="company-search"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Search company..."
            className="w-full rounded-lg border border-border px-3 py-2 text-body text-deep-text outline-none focus:border-accent"
          />
        </div>

        <div>
          <label
            htmlFor="role-filter"
            className="mb-1 block text-label text-muted-text"
          >
            Role
          </label>
          <select
            id="role-filter"
            value={initialRole}
            onChange={(e) =>
              updateParams({ role: e.target.value || null })
            }
            className="w-full rounded-lg border border-border px-3 py-2 text-body text-deep-text outline-none focus:border-accent"
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="location-filter"
            className="mb-1 block text-label text-muted-text"
          >
            Location
          </label>
          <select
            id="location-filter"
            value={initialLocation}
            onChange={(e) =>
              updateParams({ location: e.target.value || null })
            }
            className="w-full rounded-lg border border-border px-3 py-2 text-body text-deep-text outline-none focus:border-accent"
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1 block text-label text-muted-text">
            Currency
          </span>
          <div className="flex rounded-lg border border-border p-1">
            {(['INR', 'USD'] as const).map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() =>
                  updateParams({
                    currency: initialCurrency === cur ? null : cur,
                  })
                }
                className={`flex-1 rounded-md px-3 py-1.5 text-label transition-colors ${
                  initialCurrency === cur
                    ? 'bg-accent text-white'
                    : 'text-body-text hover:bg-hover-surface'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-label text-muted-text">Level</span>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <label
              key={level}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-label transition-colors ${
                selectedLevels.has(level)
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-body-text hover:bg-hover-surface'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedLevels.has(level)}
                onChange={() => toggleLevel(level)}
                className="sr-only"
              />
              {formatLevelLabel(level)}
            </label>
          ))}
        </div>
      </div>

      {(initialCompany ||
        initialRole ||
        initialLocation ||
        initialCurrency ||
        initialLevels.length > 0) && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-4 text-label text-accent hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
