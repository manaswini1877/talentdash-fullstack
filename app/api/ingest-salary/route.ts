import { NextResponse } from 'next/server';
import type { Currency, Level, Source } from '@prisma/client';
import prisma from '@/lib/prisma';
import { CURRENCIES, LEVELS, SOURCES, config } from '@/lib/config';
import {
  computeTotalCompensation,
  generateSlug,
  normalizeCompanyName,
  serializeSalary,
} from '@/lib/salary-utils';

const REQUIRED_FIELDS = [
  'company_name',
  'role',
  'level',
  'location',
  'currency',
  'experience_years',
  'base_salary',
  'source',
  'confidence_score',
] as const;

function errorResponse(field: string, message: string, status = 400) {
  return NextResponse.json({ error: true, field, message }, { status });
}

function isValidLevel(value: unknown): value is Level {
  return typeof value === 'string' && LEVELS.includes(value as Level);
}

function isValidCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && CURRENCIES.includes(value as Currency);
}

function isValidSource(value: unknown): value is Source {
  return typeof value === 'string' && SOURCES.includes(value as Source);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse('body', 'Request body must be valid JSON');
  }

  // 1. Required fields
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return errorResponse(field, `${field} is required`);
    }
  }

  const {
    company_name,
    role,
    level,
    location,
    currency,
    experience_years,
    base_salary,
    bonus,
    stock,
    source,
    confidence_score,
  } = body;

  // 2. Type checks
  if (typeof company_name !== 'string') {
    return errorResponse('company_name', 'company_name must be a string');
  }
  if (typeof role !== 'string') {
    return errorResponse('role', 'role must be a string');
  }
  if (typeof level !== 'string') {
    return errorResponse('level', 'level must be a string');
  }
  if (typeof location !== 'string') {
    return errorResponse('location', 'location must be a string');
  }
  if (typeof currency !== 'string') {
    return errorResponse('currency', 'currency must be a string');
  }
  if (typeof experience_years !== 'number' || !Number.isInteger(experience_years)) {
    return errorResponse(
      'experience_years',
      'experience_years must be an integer',
    );
  }
  if (typeof base_salary !== 'number' || !Number.isInteger(base_salary)) {
    return errorResponse('base_salary', 'base_salary must be an integer');
  }
  if (bonus !== undefined && bonus !== null) {
    if (typeof bonus !== 'number' || !Number.isInteger(bonus)) {
      return errorResponse('bonus', 'bonus must be an integer');
    }
  }
  if (stock !== undefined && stock !== null) {
    if (typeof stock !== 'number' || !Number.isInteger(stock)) {
      return errorResponse('stock', 'stock must be an integer');
    }
  }
  if (typeof source !== 'string') {
    return errorResponse('source', 'source must be a string');
  }
  if (typeof confidence_score !== 'number') {
    return errorResponse(
      'confidence_score',
      'confidence_score must be a number',
    );
  }

  // 3. Level enum
  if (!isValidLevel(level)) {
    return errorResponse(
      'level',
      `Level must be one of: ${LEVELS.join(', ')}`,
    );
  }

  if (!isValidCurrency(currency)) {
    return errorResponse(
      'currency',
      `Currency must be one of: ${CURRENCIES.join(', ')}`,
    );
  }

  if (!isValidSource(source)) {
    return errorResponse(
      'source',
      `Source must be one of: ${SOURCES.join(', ')}`,
    );
  }

  // 4. Experience years
  if (experience_years <= 0 || experience_years >= 51) {
    return errorResponse(
      'experience_years',
      'experience_years must be greater than 0 and less than 51',
    );
  }

  // 5. Base salary
  if (base_salary <= 0) {
    return errorResponse('base_salary', 'base_salary must be greater than 0');
  }

  // 6. Confidence score
  if (confidence_score < 0.0 || confidence_score > 1.0) {
    return errorResponse(
      'confidence_score',
      'confidence_score must be between 0.0 and 1.0',
    );
  }

  const normalizedName = normalizeCompanyName(company_name);
  const baseSalaryBigInt = BigInt(base_salary);
  const bonusBigInt = BigInt((bonus as number | undefined) ?? 0);
  const stockBigInt = BigInt((stock as number | undefined) ?? 0);
  const totalCompensation = computeTotalCompensation(
    baseSalaryBigInt,
    bonusBigInt,
    stockBigInt,
  );

  let company = await prisma.company.findFirst({
    where: { normalized_name: normalizedName },
  });

  if (!company) {
    let slug = generateSlug(company_name);
    const existingSlug = await prisma.company.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    company = await prisma.company.create({
      data: {
        name: company_name.trim(),
        slug,
        normalized_name: normalizedName,
        industry: 'Technology',
        headquarters: location.trim(),
      },
    });
  }

  const windowStart = new Date(
    Date.now() - config.duplicateWindowHours * 60 * 60 * 1000,
  );

  const existingRecords = await prisma.salary.findMany({
    where: {
      company_id: company.id,
      role: role.trim(),
      level,
      location: location.trim(),
      submitted_at: { gte: windowStart },
    },
  });

  for (const existing of existingRecords) {
    const diff = Number(existing.base_salary - baseSalaryBigInt);
    const percentDiff =
      (Math.abs(diff) / Number(existing.base_salary)) * 100;

    if (percentDiff <= config.duplicateSalaryTolerancePercent) {
      return NextResponse.json(
        {
          error: true,
          message:
            'Duplicate salary submission detected within the last 48 hours with similar base salary',
        },
        { status: 409 },
      );
    }
  }

  const record = await prisma.salary.create({
    data: {
      company_id: company.id,
      role: role.trim(),
      level,
      location: location.trim(),
      currency,
      experience_years,
      base_salary: baseSalaryBigInt,
      bonus: bonusBigInt,
      stock: stockBigInt,
      total_compensation: totalCompensation,
      source,
      confidence_score: confidence_score,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          headquarters: true,
          founded_year: true,
          headcount_range: true,
        },
      },
    },
  });

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/salaries');
  revalidatePath(`/companies/${company.slug}`);

  return NextResponse.json(serializeSalary(record), { status: 201 });
}
