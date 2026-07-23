-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RequestedBy" AS ENUM ('DOCTOR', 'CLINIC');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "clinics" ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "profilePhoto" TEXT;

-- CreateTable
CREATE TABLE "doctor_clinic_associations" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "fee" DOUBLE PRECISION,
    "queueMode" "QueueMode" NOT NULL DEFAULT 'LIVE',
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" "RequestedBy" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_clinic_associations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "doctor_clinic_associations" ADD CONSTRAINT "doctor_clinic_associations_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_clinic_associations" ADD CONSTRAINT "doctor_clinic_associations_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
