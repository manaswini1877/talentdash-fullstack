import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  calculateMedian,
  getLevelDistribution,
  serializeSalary,
} from '@/lib/salary-utils';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
  });

  if (!company) {
    return NextResponse.json(
      { error: true, message: 'Company not found' },
      { status: 404 },
    );
  }

  const salaries = await prisma.salary.findMany({
    where: { company_id: company.id },
    orderBy: { total_compensation: 'desc' },
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

  const tcValues = salaries.map((s) => s.total_compensation);
  const median = calculateMedian(tcValues);

  return NextResponse.json(
    {
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        industry: company.industry,
        headquarters: company.headquarters,
        founded_year: company.founded_year,
        headcount_range: company.headcount_range,
      },
      salaries: salaries.map(serializeSalary),
      median_total_compensation: median.toString(),
      level_distribution: getLevelDistribution(salaries),
    },
    {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
