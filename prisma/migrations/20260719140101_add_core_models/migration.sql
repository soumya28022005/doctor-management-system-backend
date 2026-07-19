-- AlterTable
ALTER TABLE "users" ADD COLUMN     "selfRegistered" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "receptionist_doctors" (
    "id" TEXT NOT NULL,
    "receptionistId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receptionist_doctors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receptionist_doctors_receptionistId_doctorId_key" ON "receptionist_doctors"("receptionistId", "doctorId");

-- AddForeignKey
ALTER TABLE "receptionist_doctors" ADD CONSTRAINT "receptionist_doctors_receptionistId_fkey" FOREIGN KEY ("receptionistId") REFERENCES "receptionists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receptionist_doctors" ADD CONSTRAINT "receptionist_doctors_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
