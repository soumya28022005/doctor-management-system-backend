-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "isEmergency" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "queue_logs" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "queue_logs" ADD CONSTRAINT "queue_logs_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
