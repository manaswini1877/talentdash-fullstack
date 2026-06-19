import { NextRequest, NextResponse } from 'next/server';
import type { Currency, Level, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { CURRENCIES, LEVELS, config } from '@/lib/config';
import { serializeSalary } from '@/lib/salary-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const company = searchParams.get('company')?.trim() || undefined;
  const role = searchParams.get('role')?.trim() || undefined;
  const location = searchParams.get('location')?.trim() || undefined;
  const levelParam = searchParams.get('level')?.trim() || undefined;
  const currencyParam = searchParams.get('currency')?.trim() || undefined;
  const sort = searchParams.get('sort') || 'total_comp_desc';

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const requestedLimit = parseInt(searchParams.get('limit') || String(config.defaultPageSize), 10) || config.defaultPageSize;
  const limit = Math.min(Math.max(1, requestedLimit), config.maxPageSize);

  const where: Prisma.SalaryWhereInput = {};

  if (company) {
    where.company = {
      name: { contains: company, mode: 'insensitive' },
    };
  }

  if (role) {
    where.role = { contains: role, mode: 'insensitive' };
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  if (levelParam) {
    if (!LEVELS.includes(levelParam as Level)) {
      return NextResponse.json(
        { error: true, field: 'level', message: `Level must be one of: ${LEVELS.join(', ')}` },
        { status: 400 },
      );
    }
    where.level = levelParam as Level;
  }

  if (currencyParam) {
    if (!CURRENCIES.includes(currencyParam as Currency)) {
      return NextResponse.json(
        { error: true, field: 'currency', message: `Currency must be one of: ${CURRENCIES.join(', ')}` },
        { status: 400 },
      );
    }
    where.currency = currencyParam as Currency;
  }

  let orderBy: Prisma.SalaryOrderByWithRelationInput;
  switch (sort) {
    case 'total_comp_asc':
      orderBy = { total_compensation: 'asc' };
      break;
    case 'date_desc':
      orderBy = { submitted_at: 'desc' };
      break;
    case 'total_comp_desc':
    default:
      orderBy = { total_compensation: 'desc' };
      break;
  }

  const [total, records] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return NextResponse.json(
    {
      data: records.map(serializeSalary),
      meta: { total, page, limit, totalPages },
    },
    {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
      },
    },
  );
}
