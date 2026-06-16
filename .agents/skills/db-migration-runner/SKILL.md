# DB Migration Runner Skill

## Purpose
Manage database schema migrations for StudioFlow (if/when persistent storage is added). For MVP, session storage is sufficient, but prepare for PostgreSQL.

## When to Use
- Adding persistent storage after MVP
- Changing data models (e.g., adding `payment_status` to MonetizationTrackingObject)
- Running migrations in CI/CD

## Technology Choice (recommended)
- **PostgreSQL** + **Prisma** ORM (type-safe, easy migrations)
- Migration files stored in `prisma/migrations/`

## Workflow

### 1. Define Schema in `prisma/schema.prisma`

```prisma
model User {
  id           String   @id @default(cuid())
  niche        String?
  tone         String?
  createdAt    DateTime @default(now())
  ideas        Idea[]
  posts        Post[]
  products     Product[]
}

model Idea {
  id        String   @id @default(cuid())
  userId    String
  text      String
  status    String   // saved, used, archived
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Product {
  id          String   @id @default(cuid())
  userId      String
  sourcePostId String?
  title       String
  type        String   // ebook, checklist, etc.
  priceSuggestion Float?
  status      String   // draft, published
  user        User     @relation(fields: [userId], references: [id])
}
```

### 2. Run Migrations Locally

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

### 3. CI/CD Migration Script

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigrations() {
  console.log('Running database migrations...');
  try {
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
```

### 4. Database Seeding Example

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: 'test-user' },
    update: {},
    create: { id: 'test-user', niche: 'Fitness', tone: 'casual' }
  });
}

main();
```
