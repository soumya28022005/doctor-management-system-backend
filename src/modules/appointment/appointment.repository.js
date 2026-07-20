import prisma from "../../config/db.config.js";

export const searchDoctors = async ({ doctorName, clinicName, clinicId, city, date }) => {
  const where = {
    isVerified: true,
    clinic: { isApproved: true },
  };

  if (doctorName) {
    where.user = { name: { contains: doctorName, mode: "insensitive" } };
  }
  if (clinicName) {
    where.clinic = { ...where.clinic, clinicName: { contains: clinicName, mode: "insensitive" } };
  }
  if (clinicId) {
    where.clinicId = clinicId;
  }
  if (city) {
    where.clinic = { ...where.clinic, city: { contains: city, mode: "insensitive" } };
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: {
      user: { select: { name: true } },
      clinic: { select: { id: true, clinicName: true, city: true, address: true } },
    },
  });

  // If a date is given (e.g. "clinic + date" search), attach that day's queue snapshot
  if (date) {
    const doctorsWithQueue = await Promise.all(
      doctors.map(async (doctor) => {
        const queue = await prisma.queue.findUnique({
          where: { doctorId_date: { doctorId: doctor.id, date: new Date(date) } },
        });
        return { ...doctor, todayQueue: queue || null };
      })
    );
    return doctorsWithQueue;
  }

  return doctors;
};

export const findOrCreateQueue = (doctorId, date) => {
  return prisma.queue.upsert({
    where: { doctorId_date: { doctorId, date: new Date(date) } },
    update: {},
    create: { doctorId, date: new Date(date) },
  });
};

export const getDoctorById = (id) => {
  return prisma.doctor.findUnique({ where: { id } });
};

export const getPatientById = (id) => {
  return prisma.patient.findUnique({ where: { id } });
};

// Atomically increments lastTokenIssued and creates the appointment with that token —
// this transaction guarantees no two bookings can ever get the same token number,
// even under concurrent requests.
export const createAppointmentWithToken = ({ doctorId, patientId, queueId, date, bookingSource }) => {
  return prisma.$transaction(async (tx) => {
    const queue = await tx.queue.update({
      where: { id: queueId },
      data: { lastTokenIssued: { increment: 1 } },
    });

    const appointment = await tx.appointment.create({
      data: {
        doctorId,
        patientId,
        queueId,
        date: new Date(date),
        token: queue.lastTokenIssued,
        bookingSource,
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    return { appointment, queue };
  });
};

export const createWalkInPatient = ({ name, age, phone }) => {
  return prisma.patient.create({
    data: { name, age, phone },
  });
};


export const findAppointmentsForPatient = (patientId) => {
  return prisma.appointment.findMany({
    where: { patientId },
    include: {
      doctor: { include: { user: { select: { name: true } }, clinic: { select: { clinicName: true } } } },
      queue: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findAppointmentById = (id) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: { queue: true, doctor: true, patient: { include: { user: true } } },
  });
};