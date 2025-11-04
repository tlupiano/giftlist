-- AlterEnum
ALTER TYPE "ItemStatus" ADD VALUE 'RESERVED';

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "purchaserEmail" TEXT,
ADD COLUMN     "purchaserName" TEXT;
