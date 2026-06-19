import type { Currency, Level, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { config } from '@/lib/config';

export interface SalaryQueryParams {
  company?: string;
  role?: string;
  location?: string;
  levels?: Level[];
  currency?: Currency;
  sort?: 'total_comp_desc' | 'total_comp_asc' | 'date_desc';
  page?: number;
  limit?: number;
}

export async function fetchSalaries(params: SalaryQueryParams) {
  const {
    company,
    role,
    location,
    levels,
    currency,
    sort = 'total_comp_desc',
    page = 1,
    limit = config.defaultPageSize,
  } = params;

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

  if (levels && levels.length > 0) {
    where.level = { in: levels };
  }

  if (currency) {
    where.currency = currency;
  }

  let orderBy: Prisma.SalaryOrderByWithRelationInput;
  switch (sort) {
    case 'total_comp_asc':
      orderBy = { total_compensation: 'asc' };
      break;
    case 'date_desc':
      orderBy = { submitted_at: 'desc' };
      break;
    default:
      orderBy = { total_compensation: 'desc' };
  }

  const cappedLimit = Math.min(Math.max(1, limit), config.maxPageSize);
  const safePage = Math.max(1, page);

  const [total, records, roles, locations] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * cappedLimit,
      take: cappedLimit,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.salary.findMany({
      select: { role: true },
      distinct: ['role'],
      orderBy: { role: 'asc' },
    }),
    prisma.salary.findMany({
      select: { location: true },
      distinct: ['location'],
      orderBy: { location: 'asc' },
    }),
  ]);

  return {
    records,
    total,
    page: safePage,
    limit: cappedLimit,
    totalPages: Math.ceil(total / cappedLimit) || 1,
    filterOptions: {
      roles: roles.map((r) => r.role),
      locations: locations.map((l) => l.location),
    },
  };
}

export async function fetchCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: { total_compensation: 'desc' },
      },
    },
  });

  return company;
}

export async function fetchAllCompanySlugs() {
  const companies = await prisma.company.findMany({
    select: { slug: true },
    orderBy: { slug: 'asc' },
  });

  return companies.map((c) => c.slug);
}

export async function fetchAllSalariesForCompare() {
  return prisma.salary.findMany({
    orderBy: [{ company: { name: 'asc' } }, { total_compensation: 'desc' }],
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function fetchSalaryById(id: string) {
  return prisma.salary.findUnique({
    where: { id },
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
}
