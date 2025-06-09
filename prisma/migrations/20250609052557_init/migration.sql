/*
  Warnings:

  - You are about to drop the column `icon` on the `ArticleCategory` table. All the data in the column will be lost.
  - You are about to drop the column `isVisible` on the `ArticleCategory` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `ArticleCategory` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `ArticleCategory` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ArticleCategory_slug_key";

-- AlterTable
ALTER TABLE "ArticleCategory" DROP COLUMN "icon",
DROP COLUMN "isVisible",
DROP COLUMN "slug",
DROP COLUMN "sortOrder";
