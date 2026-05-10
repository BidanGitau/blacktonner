-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new_lead', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'on_hold');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('catalogue', 'checkout', 'walk_in', 'referral', 'inbound_call', 'whatsapp', 'social', 'other');

-- CreateEnum
CREATE TYPE "LeadActivityType" AS ENUM ('call_outbound', 'call_inbound', 'whatsapp', 'email', 'meeting', 'note', 'status_change');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "company" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'other',
    "status" "LeadStatus" NOT NULL DEFAULT 'new_lead',
    "notes" TEXT,
    "estimatedValue" DECIMAL(12,2),
    "nextFollowUp" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "assignedToId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadActivityType" NOT NULL,
    "outcome" TEXT,
    "feedback" TEXT,
    "durationSec" INTEGER,
    "recordingUrl" TEXT,
    "agentId" TEXT,
    "fromStatus" "LeadStatus",
    "toStatus" "LeadStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");

-- CreateIndex
CREATE INDEX "Lead_nextFollowUp_idx" ON "Lead"("nextFollowUp");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
