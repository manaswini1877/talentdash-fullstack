import type { Currency } from '@prisma/client';

const INR_SUBUNITS = 100;
const USD_SUBUNITS = 100;

function formatIndianNumber(value: number): string {
  const absValue = Math.abs(value);
  const [integerPart, decimalPart] = absValue.toFixed(0).split('.');
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);

  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') +
    (otherNumbers ? ',' : '') +
    lastThree;

  return decimalPart ? `${formatted}.${decimalPart}` : formatted;
}

export function formatSalary(
  amountInSubunits: bigint | string | number,
  currency: Currency,
): string {
  const amount =
    typeof amountInSubunits === 'bigint'
      ? amountInSubunits
      : BigInt(amountInSubunits);

  if (currency === 'INR') {
    const rupees = Number(amount) / INR_SUBUNITS;

    if (Math.abs(rupees) >= 1_00_00_000) {
      const crores = rupees / 1_00_00_000;
      const formatted =
        crores % 1 === 0
          ? crores.toFixed(0)
          : crores.toFixed(2).replace(/\.?0+$/, '');
      return `₹${formatted} Cr`;
    }

    if (Math.abs(rupees) >= 1_00_000) {
      const lakhs = rupees / 1_00_000;
      const formatted =
        lakhs % 1 === 0
          ? lakhs.toFixed(0)
          : lakhs.toFixed(2).replace(/\.?0+$/, '');
      return `₹${formatted} L`;
    }

    return `₹${formatIndianNumber(Math.round(rupees))}`;
  }

  const majorUnits = Number(amount) / USD_SUBUNITS;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(majorUnits);
}

export function formatSalaryDelta(
  delta: number,
  currency: Currency,
): string {
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
  const formatted = formatSalary(
    BigInt(Math.abs(Math.round(delta))),
    currency,
  ).replace(/^[-+]/, '');

  return `${sign}${formatted}`;
}

export function formatOptionalAmount(
  amount: bigint | string | number,
  currency: Currency,
): string {
  const value = typeof amount === 'bigint' ? amount : BigInt(amount);
  if (value === BigInt(0)) return '—';
  return formatSalary(value, currency);
}

export function formatExperience(years: number): string {
  return `${years} yr${years === 1 ? '' : 's'}`;
}

export function formatLevelLabel(level: string): string {
  return level.replace(/_/g, ' ');
}
