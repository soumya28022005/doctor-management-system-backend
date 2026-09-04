import ApiError from "../../utils/apiError.js";
import prisma from "../../config/db.config.js";
import { findReceptionistAssignment, logQueueAction } from "./queue.repository.js";
import { QUEUE_ACTIONS } from "./queue.constants.js";
import { emitQueueUpdate, emitTokenCalled, emitAppointmentCompleted } from "../../sockets/queue.socket.js";
import { notifyUser } from "../notification/notification.service.js";

const assertAccess = async (user, doctorId, clinicId) => {
  if (user.role === "CLINIC" || user.role === "SUPER_ADMIN" || user.role === "ADMIN") return;
  if (user.role === "RECEPTIONIST") {
    const assignment = await findReceptionistAssignment(user.id, doctorId, clinicId);
    if (!assignment) throw new ApiError(403, "You are not assigned to manage this doctor's queue");
    return;
  }
  throw new ApiError(403, "You do not have permission to control this queue");
};

// 🟢 FIX: Fetch Queue strictly by Schedule ID
const getQueueOrThrow = async (doctorId, clinicId, date, scheduleId) => {
  const queue = await prisma.queue.findUnique({
    where: { doctorId_clinicId_date_scheduleId: { doctorId, clinicId, date: new Date(date), scheduleId } }
  });
  if (!queue) throw new ApiError(404, "No queue found for this session on this date");
  return queue;
};

const broadcastAndReturn = async (doctorId, clinicId, date, scheduleId, queue) => {
  const payload = {
    doctorId, clinicId, date, scheduleId,
    currentToken: queue.currentToken,
    lastTokenIssued: queue.lastTokenIssued,
    status: queue.status,
  };
  emitQueueUpdate(doctorId, clinicId, payload);
  return payload;
};

export const getQueueStatus = async (doctorId, clinicId, date, scheduleId) => {
  const queue = await prisma.queue.findUnique({
    where: { doctorId_clinicId_date_scheduleId: { doctorId, clinicId, date: new Date(date), scheduleId } },
    include: { appointments: { orderBy: { token: 'asc' }, include: { patient: true } } }
  });
  
  if (!queue) {
    return { doctorId, clinicId, date, scheduleId, currentToken: 0, lastTokenIssued: 0, status: "OPEN", appointments: [] };
  }
  return queue;
};

export const nextToken = async (user, doctorId, clinicId, date, scheduleId) => {
  await assertAccess(user, doctorId, clinicId);
  const queue = await getQueueOrThrow(doctorId, clinicId, date, scheduleId);

  if (queue.status !== "OPEN") throw new ApiError(400, `Queue is currently ${queue.status.toLowerCase()}`);
  if (queue.currentToken >= queue.lastTokenIssued) throw new ApiError(400, "No more patients waiting in this queue");

  // Complete previous appointment
  if (queue.currentToken > 0) {
    const prevAppointment = await prisma.appointment.findUnique({
      where: { queueId_token: { queueId: queue.id, token: queue.currentToken } }
    });
    if (prevAppointment) {
      await prisma.appointment.update({ where: { id: prevAppointment.id }, data: { status: "COMPLETED" } });
      emitAppointmentCompleted(doctorId, clinicId, { appointmentId: prevAppointment.id, token: prevAppointment.token });
    }
  }

  const newToken = queue.currentToken + 1;
  const updatedQueue = await prisma.queue.update({ where: { id: queue.id }, data: { currentToken: newToken } });

  // Check-in next appointment
  const nextAppointment = await prisma.appointment.findUnique({
    where: { queueId_token: { queueId: queue.id, token: newToken } },
    include: { patient: true }
  });
  
  if (nextAppointment) {
    await prisma.appointment.update({ where: { id: nextAppointment.id }, data: { status: "CHECKED_IN" } });
    if (nextAppointment.patient?.userId) {
      await notifyUser({
        userId: nextAppointment.patient.userId,
        type: "GENERAL",
        title: "Your Turn",
        message: `Token #${newToken} is now being called. Please proceed to the consultation room.`,
      });
    }
  }

  await logQueueAction(queue.id, QUEUE_ACTIONS.NEXT, user.id, { newToken });
  emitTokenCalled(doctorId, clinicId, { token: newToken, appointmentId: nextAppointment?.id || null });

  return broadcastAndReturn(doctorId, clinicId, date, scheduleId, updatedQueue);
};

export const previousToken = async (user, doctorId, clinicId, date, scheduleId) => {
  await assertAccess(user, doctorId, clinicId);
  const queue = await getQueueOrThrow(doctorId, clinicId, date, scheduleId);

  if (queue.currentToken <= 0) throw new ApiError(400, "Already at the beginning of the queue");

  const newToken = queue.currentToken - 1;
  const updatedQueue = await prisma.queue.update({ where: { id: queue.id }, data: { currentToken: newToken } });

  await logQueueAction(queue.id, QUEUE_ACTIONS.PREVIOUS, user.id, { newToken });
  return broadcastAndReturn(doctorId, clinicId, date, scheduleId, updatedQueue);
};

export const skipToken = async (user, doctorId, clinicId, date, scheduleId) => {
  await assertAccess(user, doctorId, clinicId);
  const queue = await getQueueOrThrow(doctorId, clinicId, date, scheduleId);

  if (queue.currentToken >= queue.lastTokenIssued) throw new ApiError(400, "No more patients waiting in this queue");

  const skipTokenNum = queue.currentToken + 1;
  const skippedAppointment = await prisma.appointment.findUnique({
    where: { queueId_token: { queueId: queue.id, token: skipTokenNum } }
  });
  
  if (skippedAppointment) {
    await prisma.appointment.update({ where: { id: skippedAppointment.id }, data: { status: "ABSENT" } });
  }

  const updatedQueue = await prisma.queue.update({ where: { id: queue.id }, data: { currentToken: skipTokenNum } });

  await logQueueAction(queue.id, QUEUE_ACTIONS.SKIP, user.id, { skippedToken: skipTokenNum });
  return broadcastAndReturn(doctorId, clinicId, date, scheduleId, updatedQueue);
};

export const recallToken = async (user, doctorId, clinicId, date, scheduleId, token) => {
  await assertAccess(user, doctorId, clinicId);
  const queue = await getQueueOrThrow(doctorId, clinicId, date, scheduleId);

  const appointment = await prisma.appointment.findUnique({
    where: { queueId_token: { queueId: queue.id, token } }
  });
  if (!appointment) throw new ApiError(404, "No appointment found with this token");

  await prisma.appointment.update({ where: { id: appointment.id }, data: { status: "CHECKED_IN" } });
  const updatedQueue = await prisma.queue.update({ where: { id: queue.id }, data: { currentToken: token } });

  await logQueueAction(queue.id, QUEUE_ACTIONS.RECALL, user.id, { recalledToken: token });
  return broadcastAndReturn(doctorId, clinicId, date, scheduleId, updatedQueue);
};

export const pauseQueue = async (user, doctorId, clinicId, date, scheduleId) => {
  await assertAccess(user, doctorId, clinicId);
  const queue = await getQueueOrThrow(doctorId, clinicId, date, scheduleId);

  const updatedQueue = await prisma.queue.update({ where: { id: queue.id }, data: { status: "PAUSED" } });
  await logQueueAction(queue.id, QUEUE_ACTIONS.PAUSE, user.id);
  return broadcastAndReturn(doctorId, clinicId, date, scheduleId, updatedQueue);
};

export const resumeQueue = async (user, doctorId, clinicId, date, scheduleId) => {
  await assertAccess(user, doctorId, clinicId);
  const queue = await getQueueOrThrow(doctorId, clinicId, date, scheduleId);

  const updatedQueue = await prisma.queue.update({ where: { id: queue.id }, data: { status: "OPEN" } });
  await logQueueAction(queue.id, QUEUE_ACTIONS.RESUME, user.id);
  return broadcastAndReturn(doctorId, clinicId, date, scheduleId, updatedQueue);
};

export const closeQueue = async (user, doctorId, clinicId, date, scheduleId) => {
  await assertAccess(user, doctorId, clinicId);
  const queue = await getQueueOrThrow(doctorId, clinicId, date, scheduleId);

  const updatedQueue = await prisma.queue.update({ where: { id: queue.id }, data: { status: "CLOSED" } });
  await logQueueAction(queue.id, QUEUE_ACTIONS.CLOSE, user.id);
  return broadcastAndReturn(doctorId, clinicId, date, scheduleId, updatedQueue);
};

export const reopenQueue = async (user, doctorId, clinicId, date, scheduleId) => {
  await assertAccess(user, doctorId, clinicId);
  const queue = await getQueueOrThrow(doctorId, clinicId, date, scheduleId);

  const updatedQueue = await prisma.queue.update({ where: { id: queue.id }, data: { status: "OPEN" } });
  await logQueueAction(queue.id, QUEUE_ACTIONS.REOPEN, user.id);
  return broadcastAndReturn(doctorId, clinicId, date, scheduleId, updatedQueue);
};