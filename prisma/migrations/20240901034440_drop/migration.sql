/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Customer";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_measures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_code" TEXT NOT NULL,
    "measure_datetime" DATETIME NOT NULL,
    "measure_type" TEXT NOT NULL,
    "measure_value" INTEGER,
    "has_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT NOT NULL
);
INSERT INTO "new_measures" ("customer_code", "has_confirmed", "id", "image_url", "measure_datetime", "measure_type", "measure_value") SELECT "customer_code", "has_confirmed", "id", "image_url", "measure_datetime", "measure_type", "measure_value" FROM "measures";
DROP TABLE "measures";
ALTER TABLE "new_measures" RENAME TO "measures";
CREATE UNIQUE INDEX "measures_image_url_key" ON "measures"("image_url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
