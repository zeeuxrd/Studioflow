-- CreateEnum
CREATE TYPE "TonePreference" AS ENUM ('casual', 'professional', 'educational');

-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('TikTok', 'X', 'Instagram', 'LinkedIn');

-- CreateEnum
CREATE TYPE "MonetizationGoal" AS ENUM ('grow_audience', 'make_money', 'stay_consistent');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('saved', 'used', 'archived');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'exported', 'posted');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('ebook', 'checklist', 'course', 'template');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "ConversionType" AS ENUM ('product_creation', 'purchase');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "niche" TEXT,
    "tone_preference" "TonePreference" NOT NULL DEFAULT 'casual',
    "platform_focus" "PlatformType" NOT NULL DEFAULT 'X',
    "monetization_goal" "MonetizationGoal" NOT NULL DEFAULT 'grow_audience',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentIdea" (
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "idea_text" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "IdeaStatus" NOT NULL DEFAULT 'saved',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentIdea_pkey" PRIMARY KEY ("idea_id")
);

-- CreateTable
CREATE TABLE "ContentPost" (
    "post_id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "platform_type" "PlatformType" NOT NULL,
    "content_body" TEXT NOT NULL,
    "engagement_prediction_score" DOUBLE PRECISION,
    "status" "PostStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "ProductDefinition" (
    "product_id" TEXT NOT NULL,
    "source_post_id" TEXT NOT NULL,
    "product_type" "ProductType" NOT NULL,
    "title" TEXT NOT NULL,
    "content_structure" JSONB NOT NULL,
    "monetization_price_suggestion" DOUBLE PRECISION NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "ProductDefinition_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "MonetizationTracking" (
    "tracking_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "conversion_type" "ConversionType" NOT NULL,
    "revenue_estimate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonetizationTracking_pkey" PRIMARY KEY ("tracking_id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "ContentIdea" ADD CONSTRAINT "ContentIdea_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ContentIdea"("idea_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDefinition" ADD CONSTRAINT "ProductDefinition_source_post_id_fkey" FOREIGN KEY ("source_post_id") REFERENCES "ContentPost"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonetizationTracking" ADD CONSTRAINT "MonetizationTracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
