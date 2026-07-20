import ApiError from "../../utils/apiError.js";
import prisma from "../../config/db.config.js";
import {
  searchDoctors,
  findOrCreateQueue,
  getDoctorById,
  getPatientById,
  createAppointmentWithToken,
  createWalkInPatient,
  findAppointmentsForPatient,
} from "./appointment.repository.js";
import { emitQueueUpdate } from "../../sockets/queue.socket.js";

const getPatientByUserId = (userId) => {
  return prisma.patient.findUnique({ where: { userId } });
};

export const searchForDoctors = async (filters) => {
  return searchDoctors(filters);
};

export const bookOnlineAppointment = async (patientUserId, { doctorId, date }) => {
  const patient = await getPatientByUserId(patientUserId);
  if (!patient) throw new ApiError(404, "Patient profile not found");

  await validateBookingWindow(doctorId);

  return bookAppointmentCore({
    doctorId,
    patientId: patient.id,
    date,
    bookingSource: "ONLINE",
  });
};

export const bookReceptionAppointment = async ({
  doctorId,
  date,
  patientId,
  newPatient,
  bookingSource,
}) => {
  let finalPatientId = patientId;

  if (!finalPatientId && newPatient) {
    const patient = await createWalkInPatient(newPatient);
    finalPatientId = patient.id;
  } else if (finalPatientId) {
    const existing = await getPatientById(finalPatientId);
    if (!existing) throw new ApiError(404, "Patient not found");
  }

  return bookAppointmentCore({
    doctorId,
    patientId: finalPatientId,
    date,
    bookingSource: bookingSource || "RECEPTION",
  });
};

const validateBookingWindow = async (doctorId) => {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  if (!doctor.startTime) return; // no restriction configured for this doctor

  const settings = await prisma.platformSetting.findFirst();
  const windowMinutes = settings?.bookingWindowMinutes ?? 180;

  const [hours, minutes] = doctor.startTime.split(":").map(Number);

  const now = new Date();
  const doctorStart = new Date(now);
  doctorStart.setHours(hours, minutes, 0, 0);

  const windowStart = new Date(doctorStart.getTime() - windowMinutes * 60000);
  const windowEnd = new Date(doctorStart.getTime() + windowMinutes * 60000);

  if (now < windowStart || now > windowEnd) {
    throw new ApiError(
      400,
      `Online booking for this doctor is only allowed between ${formatTime(windowStart)} and ${formatTime(windowEnd)}`
    );
  }
};

const formatTime = (date) => {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

export const getMyAppointments = async (patientUserId) => {
  const patient = await getPatientByUserId(patientUserId);
  if (!patient) throw new ApiError(404, "Patient profile not found");
  return findAppointmentsForPatient(patient.id);
};

const bookAppointmentCore = async ({ doctorId, patientId, date, bookingSource }) => {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");
  if (!doctor.isVerified) throw new ApiError(403, "Doctor is not yet verified");

  const queue = await findOrCreateQueue(doctorId, date);
  if (queue.status === "CLOSED") {
    throw new ApiError(400, "Queue is closed for this date");
  }

  const { appointment, queue: updatedQueue } = await createAppointmentWithToken({
    doctorId,
    patientId,
    queueId: queue.id,
    date,
    bookingSource,
  });

  emitQueueUpdate(doctorId, {
    doctorId,
    date,
    currentToken: updatedQueue.currentToken,
    lastTokenIssued: updatedQueue.lastTokenIssued,
    status: updatedQueue.status,
  });

  return appointment;
};

