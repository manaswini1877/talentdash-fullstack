import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeSalary } from '@/lib/salary-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const s1 = searchParams.get('s1');
  const s2 = searchParams.get('s2');

  if (!s1 || !s2) {
    return NextResponse.json(
      { error: true, message: 'Both s1 and s2 query parameters are required' },
      { status: 400 },
    );
  }

  if (s1 === s2) {
    return NextResponse.json(
      { error: true, message: 'Cannot compare a salary record with itself' },
      { status: 400 },
    );
  }

  const [record1, record2] = await Promise.all([
    prisma.salary.findUnique({
      where: { id: s1 },
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
    prisma.salary.findUnique({
      where: { id: s2 },
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

  if (!record1 || !record2) {
    return NextResponse.json(
      { error: true, message: 'One or both salary records not found' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    record1: serializeSalary(record1),
    record2: serializeSalary(record2),
    delta: {
      base_delta: Number(record1.base_salary - record2.base_salary),
      bonus_delta: Number(record1.bonus - record2.bonus),
      stock_delta: Number(record1.stock - record2.stock),
      tc_delta: Number(record1.total_compensation - record2.total_compensation),
      experience_delta: record1.experience_years - record2.experience_years,
    },
  });
}
