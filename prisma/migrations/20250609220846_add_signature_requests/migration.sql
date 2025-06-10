-- CreateEnum
CREATE TYPE "SignatureRequestStatus" AS ENUM ('SENT', 'VIEWED', 'SIGNED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "googleDriveFileId" TEXT,
ADD COLUMN     "googleDriveLink" TEXT,
ADD COLUMN     "uploadedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SignatureRequest" (
    "id" TEXT NOT NULL,
    "leadId" VARCHAR(255) NOT NULL,
    "contractType" TEXT NOT NULL,
    "status" "SignatureRequestStatus" NOT NULL DEFAULT 'SENT',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "sentById" UUID NOT NULL,
    "sentAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMPTZ(6),
    "signedAt" TIMESTAMPTZ(6),
    "contractData" JSONB NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SignatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignedContract" (
    "id" TEXT NOT NULL,
    "signatureRequestId" TEXT NOT NULL,
    "leadId" VARCHAR(255) NOT NULL,
    "contractType" TEXT NOT NULL,
    "contractData" JSONB NOT NULL,
    "googleDriveFileId" TEXT NOT NULL,
    "googleDriveLink" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "signedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerEmail" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "SignedContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignatureRequest_token_key" ON "SignatureRequest"("token");

-- CreateIndex
CREATE INDEX "SignatureRequest_leadId_idx" ON "SignatureRequest"("leadId");

-- CreateIndex
CREATE INDEX "SignatureRequest_sentById_idx" ON "SignatureRequest"("sentById");

-- CreateIndex
CREATE INDEX "SignatureRequest_status_idx" ON "SignatureRequest"("status");

-- CreateIndex
CREATE INDEX "SignatureRequest_token_idx" ON "SignatureRequest"("token");

-- CreateIndex
CREATE INDEX "SignatureRequest_expiresAt_idx" ON "SignatureRequest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SignedContract_signatureRequestId_key" ON "SignedContract"("signatureRequestId");

-- CreateIndex
CREATE INDEX "SignedContract_leadId_idx" ON "SignedContract"("leadId");

-- CreateIndex
CREATE INDEX "SignedContract_signatureRequestId_idx" ON "SignedContract"("signatureRequestId");

-- CreateIndex
CREATE INDEX "SignedContract_contractType_idx" ON "SignedContract"("contractType");

-- CreateIndex
CREATE INDEX "SignedContract_signedAt_idx" ON "SignedContract"("signedAt");

-- CreateIndex
CREATE INDEX "Contract_googleDriveFileId_idx" ON "Contract"("googleDriveFileId");

-- AddForeignKey
ALTER TABLE "SignatureRequest" ADD CONSTRAINT "SignatureRequest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRequest" ADD CONSTRAINT "SignatureRequest_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignedContract" ADD CONSTRAINT "SignedContract_signatureRequestId_fkey" FOREIGN KEY ("signatureRequestId") REFERENCES "SignatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignedContract" ADD CONSTRAINT "SignedContract_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
