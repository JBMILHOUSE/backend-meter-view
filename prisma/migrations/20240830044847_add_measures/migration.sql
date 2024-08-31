/*
  Warnings:

  - You are about to drop the `Measure` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Measure";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "measures" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_code" TEXT NOT NULL,
    "measure_datetime" DATETIME NOT NULL,
    "measure_type" TEXT NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_value" INTEGER,
    "image_url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "measures_image_url_key" ON "measures"("image_url");
