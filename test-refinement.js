const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const latestPost = await prisma.contentPost.findFirst({
    orderBy: { post_id: 'desc' },
    include: { idea: { include: { user: true } } }
  });
  if (!latestPost) {
    console.log("No posts found in database.");
    return;
  }
  console.log("Latest Post:", {
    post_id: latestPost.post_id,
    platform_type: latestPost.platform_type,
    content_body: latestPost.content_body,
    refinement_history: latestPost.refinement_history
  });

  // Try updating the refinement_history column with a dummy value
  try {
    const updated = await prisma.contentPost.update({
      where: { post_id: latestPost.post_id },
      data: {
        refinement_history: [
          {
            instruction: "test",
            content: "test content",
            created_at: new Date().toISOString()
          }
        ]
      }
    });
    console.log("Successfully updated refinement_history column!", updated.refinement_history);
  } catch (err) {
    console.error("Prisma update failed:", err);
  }
}

main().finally(() => prisma.$disconnect());
