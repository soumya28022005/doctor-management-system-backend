import prisma from "../../config/db.config.js";

export const findQueue = (doctorId, date) => {
  return prisma.queue.findUnique({
    where: { doctorId_date: { doctorId, date: new Date(date) } },
  });
};

export const findQueueWithAppointments = (doctorId, date) => {
  return prisma.queue.findUnique({
    where: { doctorId_date: { doctorId, date: new Date(date) } },
    include: {
      appointments: {
        orderBy: { token: "asc" },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              age: true,
              phone: true,
              user: { select: { name: true, phone: true } },
            },
          },
        },
      },
    },
  });
};

export const updateQueueStatus = (queueId, status) => {
  return prisma.queue.update({ where: { id: queueId }, data: { status } });
};

export const setCurrentToken = (queueId, currentToken) => {
  return prisma.queue.update({ where: { id: queueId }, data: { currentToken } });
};

export const findAppointmentByToken = (doctorId, date, token) => {
  return prisma.appointment.findUnique({
    where: { doctorId_date_token: { doctorId, date: new Date(date), token } },
  });
};

export const updateAppointmentStatus = (id, status) => {
  return prisma.appointment.update({ where: { id }, data: { status } });
};

export const findReceptionistAssignment = (userId, doctorId) => {
  return prisma.receptionist.findFirst({
    where: {
      userId,
      assignedDoctors: { some: { doctorId } },
    },
  });
};

export const createEmergencyAppointment = (doctorId, queueId, date, patientId) => {
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
        bookingSource: "RECEPTION",
        isEmergency: true,
      },
    });

    return { appointment, queue };
  });
};

export const logQueueAction = (queueId, action, performedBy, meta = {}) => {
  return prisma.queueLog.create({
    data: { queueId, action, performedBy, meta },
  });
};