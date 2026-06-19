import type { Currency, Level, Source } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';

export type { Currency, Level, Source };

export interface SalaryRecord {
  id: string;
  company_id: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: bigint;
  bonus: bigint;
  stock: bigint;
  total_compensation: bigint;
  source: Source;
  confidence_score: Decimal | string;
  is_verified: boolean;
  submitted_at: Date;
  company?: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    headquarters: string;
    founded_year: number | null;
    headcount_range: string | null;
  };
}

export interface SalariesResponse {
  data: SerializedSalary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SerializedSalary {
  id: string;
  company_id: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: string;
  bonus: string;
  stock: string;
  total_compensation: string;
  source: Source;
  confidence_score: string;
  is_verified: boolean;
  submitted_at: string;
  company?: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    headquarters: string;
    founded_year: number | null;
    headcount_range: string | null;
  };
}

export interface CompanyDetailResponse {
  company: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    headquarters: string;
    founded_year: number | null;
    headcount_range: string | null;
  };
  salaries: SerializedSalary[];
  median_total_compensation: string;
  level_distribution: Record<string, number>;
}

export interface CompareResponse {
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

export interface ApiError {
  error: true;
  field?: string;
  message: string;
}

export interface IngestSalaryPayload {
  company_name: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: number;
  bonus?: number;
  stock?: number;
  source: Source;
  confidence_score: number;
}
