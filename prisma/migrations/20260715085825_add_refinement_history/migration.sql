-- AlterTable
ALTER TABLE "ContentPost" ADD COLUMN     "refinement_history" JSONB NOT NULL DEFAULT '[]';
