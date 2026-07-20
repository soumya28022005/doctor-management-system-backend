import ApiError from "../../utils/apiError.js";
import {
  findQueue,
  findQueueWithAppointments,
  updateQueueStatus,
  setCurrentToken,
  findAppointmentByToken,
  updateAppointmentStatus,
  findReceptionistAssignment,
  createEmergencyAppointment,
  logQueueAction,
} from "./queue.repository.js";
import { QUEUE_ACTIONS } from "./queue.constants.js";
import { emitQueueUpdate } from "../../sockets/queue.socket.js";

// Strict check: a receptionist may only control doctors they're specifically assigned to.
// Clinic-role users bypass this (they own the whole clinic).
const assertAccess = async (user, doctorId) => {
  if (user.role === "CLINIC" || user.role === "SUPER_ADMIN" || user.role === "ADMIN") return;

  if (user.role === "RECEPTIONIST") {
    const assignment = await findReceptionistAssignment(user.id, doctorId);
    if (!assignment) {
      throw new ApiError(403, "You are not assigned to manage this doctor's queue");
    }
    return;
  }

  throw new ApiError(403, "You do not have permission to control this queue");
};

const getQueueOrThrow = async (doctorId, date) => {
  const queue = await findQueue(doctorId, date);
  if (!queue) throw new ApiError(404, "No queue found for this doctor on this date");
  return queue;
};

const broadcastAndReturn = async (doctorId, date, queue) => {
  const payload = {
    doctorId,
    date,
    currentToken: queue.currentToken,
    lastTokenIssued: queue.lastTokenIssued,
    status: queue.status,
  };
  emitQueueUpdate(doctorId, payload);
  return payload;
};

export const getQueueStatus = async (doctorId, date) => {
  const queue = await findQueueWithAppointments(doctorId, date);
  if (!queue) {
    return { doctorId, date, currentToken: 0, lastTokenIssued: 0, status: "OPEN", appointments: [] };
  }
  return queue;
};

export const nextToken = async (user, doctorId, date) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  if (queue.status !== "OPEN") {
    throw new ApiError(400, `Queue is currently ${queue.status.toLowerCase()}, cannot advance`);
  }
  if (queue.currentToken >= queue.lastTokenIssued) {
    throw new ApiError(400, "No more patients waiting in this queue");
  }

  // Mark the token being left behind as completed (if one existed)
  if (queue.currentToken > 0) {
    const prevAppointment = await findAppointmentByToken(doctorId, date, queue.currentToken);
    if (prevAppointment) await updateAppointmentStatus(prevAppointment.id, "COMPLETED");
  }

  const newToken = queue.currentToken + 1;
  const updatedQueue = await setCurrentToken(queue.id, newToken);

  const nextAppointment = await findAppointmentByToken(doctorId, date, newToken);
  if (nextAppointment) await updateAppointmentStatus(nextAppointment.id, "CHECKED_IN");

  await logQueueAction(queue.id, QUEUE_ACTIONS.NEXT, user.id, { newToken });

  return broadcastAndReturn(doctorId, date, updatedQueue);
};

export const previousToken = async (user, doctorId, date) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  if (queue.currentToken <= 0) {
    throw new ApiError(400, "Already at the beginning of the queue");
  }

  const newToken = queue.currentToken - 1;
  const updatedQueue = await setCurrentToken(queue.id, newToken);

  await logQueueAction(queue.id, QUEUE_ACTIONS.PREVIOUS, user.id, { newToken });

  return broadcastAndReturn(doctorId, date, updatedQueue);
};

export const skipToken = async (user, doctorId, date) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  if (queue.currentToken >= queue.lastTokenIssued) {
    throw new ApiError(400, "No more patients waiting in this queue");
  }

  const skippedAppointment = await findAppointmentByToken(doctorId, date, queue.currentToken + 1);
  if (skippedAppointment) await updateAppointmentStatus(skippedAppointment.id, "ABSENT");

  const newToken = queue.currentToken + 1;
  const updatedQueue = await setCurrentToken(queue.id, newToken);

  await logQueueAction(queue.id, QUEUE_ACTIONS.SKIP, user.id, { skippedToken: newToken });

  return broadcastAndReturn(doctorId, date, updatedQueue);
};

export const recallToken = async (user, doctorId, date, token) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  const appointment = await findAppointmentByToken(doctorId, date, token);
  if (!appointment) throw new ApiError(404, "No appointment found with this token");

  await updateAppointmentStatus(appointment.id, "CHECKED_IN");
  const updatedQueue = await setCurrentToken(queue.id, token);

  await logQueueAction(queue.id, QUEUE_ACTIONS.RECALL, user.id, { recalledToken: token });

  return broadcastAndReturn(doctorId, date, updatedQueue);
};

export const pauseQueue = async (user, doctorId, date) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  const updatedQueue = await updateQueueStatus(queue.id, "PAUSED");
  await logQueueAction(queue.id, QUEUE_ACTIONS.PAUSE, user.id);

  return broadcastAndReturn(doctorId, date, updatedQueue);
};

export const resumeQueue = async (user, doctorId, date) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  const updatedQueue = await updateQueueStatus(queue.id, "OPEN");
  await logQueueAction(queue.id, QUEUE_ACTIONS.RESUME, user.id);

  return broadcastAndReturn(doctorId, date, updatedQueue);
};

export const closeQueue = async (user, doctorId, date) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  const updatedQueue = await updateQueueStatus(queue.id, "CLOSED");
  await logQueueAction(queue.id, QUEUE_ACTIONS.CLOSE, user.id);

  return broadcastAndReturn(doctorId, date, updatedQueue);
};

export const reopenQueue = async (user, doctorId, date) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  const updatedQueue = await updateQueueStatus(queue.id, "OPEN");
  await logQueueAction(queue.id, QUEUE_ACTIONS.REOPEN, user.id);

  return broadcastAndReturn(doctorId, date, updatedQueue);
};

export const emergencyToken = async (user, doctorId, date, patientId) => {
  await assertAccess(user, doctorId);
  const queue = await getQueueOrThrow(doctorId, date);

  const { appointment, queue: updatedQueue } = await createEmergencyAppointment(
    doctorId,
    queue.id,
    date,
    patientId
  );

  await logQueueAction(queue.id, QUEUE_ACTIONS.EMERGENCY, user.id, {
    token: appointment.token,
    patientId,
  });

  await broadcastAndReturn(doctorId, date, updatedQueue);
  return appointment;
};