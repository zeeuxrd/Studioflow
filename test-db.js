const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const ideas = await prisma.contentIdea.findMany({ orderBy: { created_at: 'desc' }, take: 5 });
  console.log(JSON.stringify(ideas, null, 2));
}

main().finally(() => prisma.$disconnect());
