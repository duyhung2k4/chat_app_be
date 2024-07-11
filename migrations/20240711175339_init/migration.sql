/*
  Warnings:

  - You are about to drop the column `delete_at` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `delete_at` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `delete_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "delete_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "delete_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "delete_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);
