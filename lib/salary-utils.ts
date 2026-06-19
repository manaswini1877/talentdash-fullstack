import type { SalaryRecord, SerializedSalary } from '@/types/salary';

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+(india|inc|llc|ltd|limited|corp|corporation)$/i, '')
    .trim();
}

export function generateSlug(name: string): string {
  const base = normalizeCompanyName(name)
    .replace(/\s+(india|inc|llc|ltd|limited|corp|corporation)$/i, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return base || 'company';
}

export function computeTotalCompensation(
  baseSalary: bigint,
  bonus?: bigint | null,
  stock?: bigint | null,
): bigint {
  return baseSalary + (bonus ?? BigInt(0)) + (stock ?? BigInt(0));
}

export function serializeSalary(record: SalaryRecord): SerializedSalary {
  return {
    id: record.id,
    company_id: record.company_id,
    role: record.role,
    level: record.level,
    location: record.location,
    currency: record.currency,
    experience_years: record.experience_years,
    base_salary: record.base_salary.toString(),
    bonus: record.bonus.toString(),
    stock: record.stock.toString(),
    total_compensation: record.total_compensation.toString(),
    source: record.source,
    confidence_score: record.confidence_score.toString(),
    is_verified: record.is_verified,
    submitted_at: record.submitted_at.toISOString(),
    company: record.company,
  };
}

export function calculateMedian(values: bigint[]): bigint {
  if (values.length === 0) return BigInt(0);

  const sorted = [...values].sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / BigInt(2);
  }

  return sorted[mid];
}

export function getLevelDistribution(
  salaries: { level: string }[],
): Record<string, number> {
  return salaries.reduce<Record<string, number>>((acc, salary) => {
    acc[salary.level] = (acc[salary.level] ?? 0) + 1;
    return acc;
  }, {});
}
