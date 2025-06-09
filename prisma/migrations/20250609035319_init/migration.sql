-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'REVIEWER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');

-- CreateEnum
CREATE TYPE "WikiStatus" AS ENUM ('PENDING', 'REJECTED', 'DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "nickname" VARCHAR(50),
    "avatar" TEXT,
    "avatarOriginal" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" VARCHAR(45),
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wiki" (
    "id" SERIAL NOT NULL,
    "isMyCustomWiki" BOOLEAN NOT NULL DEFAULT false,
    "hot" INTEGER NOT NULL DEFAULT 0,
    "name" VARCHAR(100) NOT NULL,
    "subdomain" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "metaDescription" TEXT,
    "backgroundImage" VARCHAR(200),
    "logo" VARCHAR(200),
    "primaryColor" VARCHAR(7) NOT NULL DEFAULT '#000000',
    "settings" JSONB,
    "status" "WikiStatus" NOT NULL DEFAULT 'PENDING',
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "contributorCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedById" INTEGER,
    "tags" TEXT[],
    "customDomain" VARCHAR(100),
    "contactInfo" VARCHAR(100),
    "applyReason" TEXT,
    "license" VARCHAR(50) NOT NULL DEFAULT 'CC-BY-SA',

    CONSTRAINT "Wiki_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "detailPageId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentData" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" INTEGER NOT NULL,
    "wikiId" INTEGER,
    "editorId" INTEGER NOT NULL,
    "detailPageId" INTEGER,

    CONSTRAINT "ComponentData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "type" INTEGER NOT NULL,
    "templateId" INTEGER,

    CONSTRAINT "ComponentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailPage" (
    "id" SERIAL NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "creatorId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "componentDataId" INTEGER NOT NULL,

    CONSTRAINT "DetailPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailPageTemplate" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,

    CONSTRAINT "DetailPageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wiki_name_key" ON "Wiki"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Wiki_subdomain_key" ON "Wiki"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Wiki_customDomain_key" ON "Wiki"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wiki" ADD CONSTRAINT "Wiki_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wiki" ADD CONSTRAINT "Wiki_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_detailPageId_fkey" FOREIGN KEY ("detailPageId") REFERENCES "DetailPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentData" ADD CONSTRAINT "ComponentData_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "ComponentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentData" ADD CONSTRAINT "ComponentData_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "Wiki"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentData" ADD CONSTRAINT "ComponentData_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentData" ADD CONSTRAINT "ComponentData_detailPageId_fkey" FOREIGN KEY ("detailPageId") REFERENCES "DetailPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPage" ADD CONSTRAINT "DetailPage_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPage" ADD CONSTRAINT "DetailPage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DetailPageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
