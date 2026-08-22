import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Parse .env manually
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up all test user data from the database...");

  const deletedTokens = await prisma.verificationToken.deleteMany({});
  const deletedAccounts = await prisma.account.deleteMany({});
  const deletedSessions = await prisma.session.deleteMany({});
  const deletedProducts = await prisma.productDefinition.deleteMany({});
  const deletedPosts = await prisma.contentPost.deleteMany({});
  const deletedIdeas = await prisma.contentIdea.deleteMany({});
  const deletedUsers = await prisma.user.deleteMany({});

  console.log(`Database cleanup completed successfully!`);
  console.log(`- Deleted Users: ${deletedUsers.count}`);
  console.log(`- Deleted Ideas: ${deletedIdeas.count}`);
  console.log(`- Deleted Posts: ${deletedPosts.count}`);
  console.log(`- Deleted Products: ${deletedProducts.count}`);
}

main()
  .catch((err) => {
    console.error("Error cleaning database:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
