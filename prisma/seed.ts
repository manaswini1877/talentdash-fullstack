import {
  PrismaClient,
  Currency,
  Level,
  Source,
} from '@prisma/client';

const prisma = new PrismaClient();

const toPaise = (rupees: number) => BigInt(rupees * 100);
const toCents = (dollars: number) => BigInt(dollars * 100);

const companies = [
  {
    name: 'Google India',
    slug: 'google',
    normalized_name: 'google',
    industry: 'Technology',
    headquarters: 'Mountain View, USA',
    founded_year: 1998,
    headcount_range: '150,000+',
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    normalized_name: 'amazon',
    industry: 'E-commerce & Cloud',
    headquarters: 'Seattle, USA',
    founded_year: 1994,
    headcount_range: '1,500,000+',
  },
  {
    name: 'Meta',
    slug: 'meta',
    normalized_name: 'meta',
    industry: 'Social Media',
    headquarters: 'Menlo Park, USA',
    founded_year: 2004,
    headcount_range: '70,000+',
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    normalized_name: 'microsoft',
    industry: 'Technology',
    headquarters: 'Redmond, USA',
    founded_year: 1975,
    headcount_range: '220,000+',
  },
  {
    name: 'Flipkart',
    slug: 'flipkart',
    normalized_name: 'flipkart',
    industry: 'E-commerce',
    headquarters: 'Bengaluru, India',
    founded_year: 2007,
    headcount_range: '30,000+',
  },
  {
    name: 'Meesho',
    slug: 'meesho',
    normalized_name: 'meesho',
    industry: 'Social Commerce',
    headquarters: 'Bengaluru, India',
    founded_year: 2015,
    headcount_range: '1,500+',
  },
  {
    name: 'NVIDIA',
    slug: 'nvidia',
    normalized_name: 'nvidia',
    industry: 'Semiconductors',
    headquarters: 'Santa Clara, USA',
    founded_year: 1993,
    headcount_range: '26,000+',
  },
  {
    name: 'TCS',
    slug: 'tcs',
    normalized_name: 'tcs',
    industry: 'IT Services',
    headquarters: 'Mumbai, India',
    founded_year: 1968,
    headcount_range: '600,000+',
  },
  {
    name: 'Infosys',
    slug: 'infosys',
    normalized_name: 'infosys',
    industry: 'IT Services',
    headquarters: 'Bengaluru, India',
    founded_year: 1981,
    headcount_range: '300,000+',
  },
  {
    name: 'Wipro',
    slug: 'wipro',
    normalized_name: 'wipro',
    industry: 'IT Services',
    headquarters: 'Bengaluru, India',
    founded_year: 1945,
    headcount_range: '240,000+',
  },
  {
    name: 'Razorpay',
    slug: 'razorpay',
    normalized_name: 'razorpay',
    industry: 'Fintech',
    headquarters: 'Bengaluru, India',
    founded_year: 2014,
    headcount_range: '3,000+',
  },
  {
    name: 'Zepto',
    slug: 'zepto',
    normalized_name: 'zepto',
    industry: 'Quick Commerce',
    headquarters: 'Mumbai, India',
    founded_year: 2021,
    headcount_range: '5,000+',
  },
];

type SalarySeed = {
  companySlug: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: bigint;
  bonus?: bigint;
  stock?: bigint;
  source: Source;
  confidence_score: number;
  is_verified?: boolean;
};

function tc(base: bigint, bonus = BigInt(0), stock = BigInt(0)) {
  return base + bonus + stock;
}

const salarySeeds: SalarySeed[] = [
  // Google - normalization variants use same slug
  { companySlug: 'google', role: 'Software Engineer', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: toPaise(2800000), bonus: toPaise(400000), stock: toPaise(600000), source: 'CONTRIBUTOR', confidence_score: 0.92 },
  { companySlug: 'google', role: 'Software Engineer', level: 'L4', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: toPaise(4200000), bonus: toPaise(600000), stock: toPaise(1200000), source: 'CONTRIBUTOR', confidence_score: 0.95 },
  { companySlug: 'google', role: 'Senior Software Engineer', level: 'L5', location: 'Hyderabad', currency: 'INR', experience_years: 7, base_salary: toPaise(5800000), bonus: toPaise(900000), stock: toPaise(2000000), source: 'SCRAPED', confidence_score: 0.88 },
  { companySlug: 'google', role: 'Staff Software Engineer', level: 'L6', location: 'Bengaluru', currency: 'INR', experience_years: 10, base_salary: toPaise(8500000), bonus: toPaise(1500000), stock: toPaise(3500000), source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { companySlug: 'google', role: 'Software Engineer', level: 'L3', location: 'San Francisco', currency: 'USD', experience_years: 1, base_salary: toCents(150000), bonus: toCents(25000), stock: toCents(80000), source: 'SCRAPED', confidence_score: 0.87 },
  { companySlug: 'google', role: 'Senior Software Engineer', level: 'L5', location: 'London', currency: 'GBP', experience_years: 6, base_salary: BigInt(9500000), bonus: BigInt(1500000), stock: BigInt(3000000), source: 'AI_INFERRED', confidence_score: 0.75 },

  // Amazon
  { companySlug: 'amazon', role: 'SDE I', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 1, base_salary: toPaise(2200000), bonus: toPaise(300000), stock: toPaise(400000), source: 'CONTRIBUTOR', confidence_score: 0.9 },
  { companySlug: 'amazon', role: 'SDE II', level: 'SDE_II', location: 'Hyderabad', currency: 'INR', experience_years: 3, base_salary: toPaise(3500000), bonus: toPaise(500000), stock: toPaise(800000), source: 'CONTRIBUTOR', confidence_score: 0.93 },
  { companySlug: 'amazon', role: 'SDE III', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 6, base_salary: toPaise(5200000), bonus: toPaise(700000), stock: toPaise(1500000), source: 'SCRAPED', confidence_score: 0.86 },
  { companySlug: 'amazon', role: 'Principal Engineer', level: 'PRINCIPAL', location: 'Seattle', currency: 'USD', experience_years: 15, base_salary: toCents(280000), bonus: toCents(80000), stock: toCents(350000), source: 'CONTRIBUTOR', confidence_score: 0.97, is_verified: true },
  { companySlug: 'amazon', role: 'SDE II', level: 'SDE_II', location: 'Mumbai', currency: 'INR', experience_years: 4, base_salary: toPaise(3800000), bonus: toPaise(0), stock: toPaise(900000), source: 'CONTRIBUTOR', confidence_score: 0.89 },
  { companySlug: 'amazon', role: 'SDE I', level: 'SDE_I', location: 'Pune', currency: 'INR', experience_years: 2, base_salary: toPaise(2400000), bonus: toPaise(350000), stock: toPaise(450000), source: 'AI_INFERRED', confidence_score: 0.72 },

  // Meta
  { companySlug: 'meta', role: 'Software Engineer E3', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: toPaise(3000000), bonus: toPaise(450000), stock: toPaise(700000), source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { companySlug: 'meta', role: 'Software Engineer E4', level: 'L4', location: 'Hyderabad', currency: 'INR', experience_years: 4, base_salary: toPaise(4500000), bonus: toPaise(650000), stock: toPaise(1300000), source: 'SCRAPED', confidence_score: 0.85 },
  { companySlug: 'meta', role: 'Software Engineer E5', level: 'L5', location: 'San Francisco', currency: 'USD', experience_years: 7, base_salary: toCents(210000), bonus: toCents(40000), stock: toCents(180000), source: 'CONTRIBUTOR', confidence_score: 0.94 },
  { companySlug: 'meta', role: 'Software Engineer E6', level: 'L6', location: 'London', currency: 'GBP', experience_years: 11, base_salary: BigInt(11000000), bonus: BigInt(2000000), stock: BigInt(4500000), source: 'SCRAPED', confidence_score: 0.82 },

  // Microsoft
  { companySlug: 'microsoft', role: 'Software Engineer II', level: 'SDE_II', location: 'Hyderabad', currency: 'INR', experience_years: 3, base_salary: toPaise(3200000), bonus: toPaise(450000), stock: toPaise(750000), source: 'CONTRIBUTOR', confidence_score: 0.9 },
  { companySlug: 'microsoft', role: 'Senior Software Engineer', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 6, base_salary: toPaise(5000000), bonus: toPaise(700000), stock: toPaise(1400000), source: 'CONTRIBUTOR', confidence_score: 0.92 },
  { companySlug: 'microsoft', role: 'Principal Software Engineer', level: 'PRINCIPAL', location: 'Redmond', currency: 'USD', experience_years: 14, base_salary: toCents(260000), bonus: toCents(70000), stock: toCents(300000), source: 'SCRAPED', confidence_score: 0.88 },
  { companySlug: 'microsoft', role: 'Software Engineer', level: 'SDE_I', location: 'Pune', currency: 'INR', experience_years: 1, base_salary: toPaise(2100000), bonus: toPaise(300000), stock: toPaise(350000), source: 'AI_INFERRED', confidence_score: 0.7 },
  { companySlug: 'microsoft', role: 'Staff Engineer', level: 'STAFF', location: 'Delhi', currency: 'INR', experience_years: 9, base_salary: toPaise(7200000), bonus: toPaise(1100000), stock: toPaise(2800000), source: 'CONTRIBUTOR', confidence_score: 0.93 },

  // Flipkart
  { companySlug: 'flipkart', role: 'Software Development Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: toPaise(1800000), bonus: toPaise(250000), stock: toPaise(300000), source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { companySlug: 'flipkart', role: 'SDE II', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: toPaise(2800000), bonus: toPaise(400000), stock: toPaise(600000), source: 'SCRAPED', confidence_score: 0.84 },
  { companySlug: 'flipkart', role: 'SDE III', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: toPaise(4500000), bonus: toPaise(600000), stock: toPaise(1200000), source: 'CONTRIBUTOR', confidence_score: 0.9 },
  { companySlug: 'flipkart', role: 'Engineering Manager', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 10, base_salary: toPaise(6500000), bonus: toPaise(900000), stock: toPaise(2000000), source: 'CONTRIBUTOR', confidence_score: 0.87 },

  // Meesho - single level only (SDE_II)
  { companySlug: 'meesho', role: 'Backend Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 3, base_salary: toPaise(2200000), bonus: toPaise(200000), stock: toPaise(400000), source: 'CONTRIBUTOR', confidence_score: 0.86 },

  // NVIDIA - high stock PRINCIPAL
  { companySlug: 'nvidia', role: 'Principal Engineer', level: 'PRINCIPAL', location: 'San Francisco', currency: 'USD', experience_years: 16, base_salary: toCents(320000), bonus: toCents(90000), stock: toCents(800000), source: 'CONTRIBUTOR', confidence_score: 0.96, is_verified: true },
  { companySlug: 'nvidia', role: 'Senior Software Engineer', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: toPaise(5500000), bonus: toPaise(800000), stock: toPaise(2500000), source: 'SCRAPED', confidence_score: 0.83 },
  { companySlug: 'nvidia', role: 'Software Engineer', level: 'L4', location: 'Hyderabad', currency: 'INR', experience_years: 4, base_salary: toPaise(4000000), bonus: toPaise(500000), stock: toPaise(1000000), source: 'CONTRIBUTOR', confidence_score: 0.89 },
  { companySlug: 'nvidia', role: 'Staff Engineer', level: 'STAFF', location: 'San Francisco', currency: 'USD', experience_years: 12, base_salary: toCents(250000), bonus: toCents(60000), stock: toCents(450000), source: 'SCRAPED', confidence_score: 0.85 },

  // TCS
  { companySlug: 'tcs', role: 'Systems Engineer', level: 'L3', location: 'Mumbai', currency: 'INR', experience_years: 2, base_salary: toPaise(600000), bonus: toPaise(50000), stock: BigInt(0), source: 'SCRAPED', confidence_score: 0.78 },
  { companySlug: 'tcs', role: 'IT Analyst', level: 'L4', location: 'Pune', currency: 'INR', experience_years: 4, base_salary: toPaise(900000), bonus: toPaise(80000), stock: BigInt(0), source: 'CONTRIBUTOR', confidence_score: 0.8 },
  { companySlug: 'tcs', role: 'Tech Lead', level: 'L5', location: 'Hyderabad', currency: 'INR', experience_years: 8, base_salary: toPaise(1400000), bonus: toPaise(120000), stock: BigInt(0), source: 'AI_INFERRED', confidence_score: 0.65 },
  { companySlug: 'tcs', role: 'Assistant Consultant', level: 'L4', location: 'Delhi', currency: 'INR', experience_years: 5, base_salary: toPaise(1100000), bonus: toPaise(100000), stock: BigInt(0), source: 'SCRAPED', confidence_score: 0.77 },
  { companySlug: 'tcs', role: 'Consultant', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 9, base_salary: toPaise(1600000), bonus: toPaise(150000), stock: BigInt(0), source: 'CONTRIBUTOR', confidence_score: 0.82 },

  // Infosys
  { companySlug: 'infosys', role: 'Systems Engineer', level: 'L3', location: 'Mysore', currency: 'INR', experience_years: 1, base_salary: toPaise(450000), bonus: toPaise(30000), stock: BigInt(0), source: 'SCRAPED', confidence_score: 0.76 },
  { companySlug: 'infosys', role: 'Technology Analyst', level: 'L4', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: toPaise(950000), bonus: toPaise(70000), stock: BigInt(0), source: 'CONTRIBUTOR', confidence_score: 0.81 },
  { companySlug: 'infosys', role: 'Senior Consultant', level: 'L5', location: 'Hyderabad', currency: 'INR', experience_years: 7, base_salary: toPaise(1300000), bonus: toPaise(100000), stock: BigInt(0), source: 'SCRAPED', confidence_score: 0.79 },
  { companySlug: 'infosys', role: 'Lead Consultant', level: 'L6', location: 'Pune', currency: 'INR', experience_years: 10, base_salary: toPaise(1800000), bonus: toPaise(150000), stock: BigInt(0), source: 'CONTRIBUTOR', confidence_score: 0.84 },
  { companySlug: 'infosys', role: 'Principal Consultant', level: 'PRINCIPAL', location: 'Bengaluru', currency: 'INR', experience_years: 15, base_salary: toPaise(3500000), bonus: toPaise(400000), stock: toPaise(500000), source: 'CONTRIBUTOR', confidence_score: 0.88 },

  // Wipro
  { companySlug: 'wipro', role: 'Project Engineer', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: toPaise(550000), bonus: toPaise(40000), stock: BigInt(0), source: 'SCRAPED', confidence_score: 0.74 },
  { companySlug: 'wipro', role: 'Senior Project Engineer', level: 'L4', location: 'Hyderabad', currency: 'INR', experience_years: 5, base_salary: toPaise(850000), bonus: toPaise(60000), stock: BigInt(0), source: 'CONTRIBUTOR', confidence_score: 0.78 },
  { companySlug: 'wipro', role: 'Team Lead', level: 'L5', location: 'Pune', currency: 'INR', experience_years: 8, base_salary: toPaise(1200000), bonus: toPaise(90000), stock: BigInt(0), source: 'AI_INFERRED', confidence_score: 0.68 },
  { companySlug: 'wipro', role: 'Architect', level: 'STAFF', location: 'Mumbai', currency: 'INR', experience_years: 12, base_salary: toPaise(2200000), bonus: toPaise(180000), stock: BigInt(0), source: 'CONTRIBUTOR', confidence_score: 0.83 },

  // Razorpay
  { companySlug: 'razorpay', role: 'Software Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: toPaise(2000000), bonus: toPaise(200000), stock: toPaise(500000), source: 'CONTRIBUTOR', confidence_score: 0.9 },
  { companySlug: 'razorpay', role: 'Senior Software Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: toPaise(3200000), bonus: toPaise(350000), stock: toPaise(800000), source: 'CONTRIBUTOR', confidence_score: 0.92 },
  { companySlug: 'razorpay', role: 'Staff Engineer', level: 'STAFF', location: 'Bengaluru', currency: 'INR', experience_years: 8, base_salary: toPaise(5500000), bonus: toPaise(600000), stock: toPaise(1500000), source: 'SCRAPED', confidence_score: 0.86 },
  { companySlug: 'razorpay', role: 'Engineering Manager', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 10, base_salary: toPaise(6000000), bonus: toPaise(700000), stock: toPaise(1800000), source: 'CONTRIBUTOR', confidence_score: 0.91 },

  // Zepto
  { companySlug: 'zepto', role: 'Backend Engineer', level: 'SDE_I', location: 'Mumbai', currency: 'INR', experience_years: 1, base_salary: toPaise(1600000), bonus: toPaise(150000), stock: toPaise(300000), source: 'CONTRIBUTOR', confidence_score: 0.85 },
  { companySlug: 'zepto', role: 'Senior Backend Engineer', level: 'SDE_II', location: 'Mumbai', currency: 'INR', experience_years: 3, base_salary: toPaise(2600000), bonus: toPaise(250000), stock: toPaise(550000), source: 'SCRAPED', confidence_score: 0.82 },
  { companySlug: 'zepto', role: 'Tech Lead', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 6, base_salary: toPaise(4000000), bonus: toPaise(400000), stock: toPaise(900000), source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { companySlug: 'zepto', role: 'Engineering Lead', level: 'L5', location: 'Mumbai', currency: 'INR', experience_years: 8, base_salary: toPaise(4800000), bonus: toPaise(500000), stock: toPaise(1100000), source: 'AI_INFERRED', confidence_score: 0.73 },

  // Additional records for IC levels and edge cases
  { companySlug: 'google', role: 'Software Engineer', level: 'IC4', location: 'Bengaluru', currency: 'INR', experience_years: 5, base_salary: toPaise(4800000), bonus: toPaise(700000), stock: toPaise(1500000), source: 'CONTRIBUTOR', confidence_score: 0.9 },
  { companySlug: 'meta', role: 'Software Engineer', level: 'IC5', location: 'Hyderabad', currency: 'INR', experience_years: 8, base_salary: toPaise(6200000), bonus: toPaise(900000), stock: toPaise(2200000), source: 'SCRAPED', confidence_score: 0.84 },
  { companySlug: 'amazon', role: 'SDE II', level: 'SDE_II', location: 'Delhi', currency: 'INR', experience_years: 3, base_salary: toPaise(3400000), bonus: toPaise(450000), stock: BigInt(0), source: 'CONTRIBUTOR', confidence_score: 0.87 },
  { companySlug: 'microsoft', role: 'Software Engineer', level: 'L4', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: toPaise(3800000), bonus: BigInt(0), stock: toPaise(900000), source: 'CONTRIBUTOR', confidence_score: 0.88 },
  { companySlug: 'flipkart', role: 'Data Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 3, base_salary: toPaise(2600000), bonus: toPaise(300000), stock: toPaise(500000), source: 'SCRAPED', confidence_score: 0.81 },
  { companySlug: 'nvidia', role: 'GPU Engineer', level: 'L3', location: 'Pune', currency: 'INR', experience_years: 2, base_salary: toPaise(3500000), bonus: toPaise(400000), stock: toPaise(800000), source: 'CONTRIBUTOR', confidence_score: 0.87 },
  { companySlug: 'razorpay', role: 'Platform Engineer', level: 'IC4', location: 'Bengaluru', currency: 'INR', experience_years: 6, base_salary: toPaise(4200000), bonus: toPaise(450000), stock: toPaise(1000000), source: 'CONTRIBUTOR', confidence_score: 0.89 },
  { companySlug: 'zepto', role: 'Mobile Engineer', level: 'SDE_I', location: 'Pune', currency: 'INR', experience_years: 2, base_salary: toPaise(1700000), bonus: toPaise(120000), stock: toPaise(250000), source: 'AI_INFERRED', confidence_score: 0.71 },
  { companySlug: 'google', role: 'Site Reliability Engineer', level: 'L4', location: 'Mumbai', currency: 'INR', experience_years: 5, base_salary: toPaise(4400000), bonus: toPaise(550000), stock: toPaise(1100000), source: 'CONTRIBUTOR', confidence_score: 0.91 },
  { companySlug: 'amazon', role: 'Applied Scientist', level: 'L5', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: toPaise(5600000), bonus: toPaise(750000), stock: toPaise(1800000), source: 'SCRAPED', confidence_score: 0.83 },
];

async function main() {
  console.log('Seeding database...');

  await prisma.salary.deleteMany();
  await prisma.company.deleteMany();

  const companyMap = new Map<string, string>();

  for (const company of companies) {
    const created = await prisma.company.create({ data: company });
    companyMap.set(company.slug, created.id);
  }

  // Demonstrate normalization: GOOGLE and "google " resolve to same company
  const googleId = companyMap.get('google')!;
  const normalizationVariants = [
    { input: 'GOOGLE', role: 'Software Engineer', level: 'L3' as Level, location: 'Delhi', experience_years: 2 },
    { input: 'google ', role: 'Frontend Engineer', level: 'L4' as Level, location: 'Pune', experience_years: 3 },
  ];

  for (const variant of normalizationVariants) {
    salarySeeds.push({
      companySlug: 'google',
      role: variant.role,
      level: variant.level,
      location: variant.location,
      currency: 'INR',
      experience_years: variant.experience_years,
      base_salary: toPaise(3000000 + variant.experience_years * 200000),
      bonus: toPaise(400000),
      stock: toPaise(600000),
      source: 'CONTRIBUTOR',
      confidence_score: 0.9,
    });
  }

  void googleId;
  void normalizationVariants;

  let count = 0;
  for (const seed of salarySeeds) {
    const companyId = companyMap.get(seed.companySlug);
    if (!companyId) {
      throw new Error(`Company not found: ${seed.companySlug}`);
    }

    const bonus = seed.bonus ?? BigInt(0);
    const stock = seed.stock ?? BigInt(0);

    await prisma.salary.create({
      data: {
        company_id: companyId,
        role: seed.role,
        level: seed.level,
        location: seed.location,
        currency: seed.currency,
        experience_years: seed.experience_years,
        base_salary: seed.base_salary,
        bonus,
        stock,
        total_compensation: tc(seed.base_salary, bonus, stock),
        source: seed.source,
        confidence_score: seed.confidence_score,
        is_verified: seed.is_verified ?? false,
      },
    });
    count++;
  }

  console.log(`Seeded ${companies.length} companies and ${count} salary records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
