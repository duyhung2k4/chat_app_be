-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "delete_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "delete_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "delete_at" DROP NOT NULL;
