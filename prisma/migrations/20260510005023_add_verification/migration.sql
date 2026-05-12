-- AlterTable
ALTER TABLE "UserAuth" ADD COLUMN     "isMfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerifiedAt" TIMESTAMP(3);
