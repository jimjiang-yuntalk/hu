/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Article` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_ArticleCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ArticleCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ArticleCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "court_area" TEXT,
    "difficulty" TEXT,
    "video_url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Article" ("content", "court_area", "createdAt", "difficulty", "id", "title", "updatedAt", "video_url") SELECT "content", "court_area", "createdAt", "difficulty", "id", "title", "updatedAt", "video_url" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleCategories_AB_unique" ON "_ArticleCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleCategories_B_index" ON "_ArticleCategories"("B");
