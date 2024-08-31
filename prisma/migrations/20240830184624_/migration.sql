/*
  Warnings:

  - You are about to drop the column `confirmed_value` on the `measures` table. All the data in the column will be lost.
  - You are about to alter the column `has_confirmed` on the `measures` table. The data in that column could be lost. The data in that column will be cast from `Boolean` to `Int`.
  - Added the required column `created_at` to the `measures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `measures` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_measures" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_code" TEXT NOT NULL,
    "measure_datetime" DATETIME NOT NULL,
    "measure_type" TEXT NOT NULL,
    "measure_value" INTEGER,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "has_confirmed" INTEGER,
    "image_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    "update_at" DATETIME NOT NULL
);
INSERT INTO "new_measures" ("customer_code", "has_confirmed", "id", "image_url", "measure_datetime", "measure_type") SELECT "customer_code", "has_confirmed", "id", "image_url", "measure_datetime", "measure_type" FROM "measures";
DROP TABLE "measures";
ALTER TABLE "new_measures" RENAME TO "measures";
CREATE UNIQUE INDEX "measures_image_url_key" ON "measures"("image_url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
