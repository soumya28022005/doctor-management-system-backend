import ApiError from "../../utils/apiError.js";
import { hashPassword } from "../auth/auth.helper.js";
import { findUserByEmail, updateUserPassword } from "../auth/auth.repository.js";
import {
  findClinicByUserId,
  updateClinicProfile,
  createDoctorWithUser,
  createReceptionistWithUser,
  findDoctorsByClinic,
  findReceptionistsByClinic,
  findDoctorById,
  findReceptionistById,
  assignDoctorsToReceptionist,
  findAssignedDoctorsForReceptionistUser,
  findDoctorOrReceptionistUser,
} from "./clinic.repository.js";

export const getMyClinicProfile = async (userId) => {
  const clinic = await findClinicByUserId(userId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinic;
};

export const updateMyClinicProfile = async (userId, data) => {
  const clinic = await findClinicByUserId(userId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return updateClinicProfile(clinic.id, data);
};

export const addDoctor = async (clinicUserId, payload) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  if (!clinic.isApproved) {
    throw new ApiError(403, "Your clinic is not yet approved by admin");
  }

  const existing = await findUserByEmail(payload.email);
  if (existing) throw new ApiError(409, "A user with this email already exists");

  const hashedPassword = await hashPassword(payload.password);
  const { specialization, qualification, experience, fee, ...userFields } = payload;

  const { user, doctor } = await createDoctorWithUser({
    userData: { ...userFields, password: hashedPassword },
    doctorData: { specialization, qualification, experience, fee },
    clinicId: clinic.id,
  });

  const { password, refreshToken, ...safeUser } = user;
  return { user: safeUser, doctor };
};

export const addReceptionist = async (clinicUserId, payload) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  if (!clinic.isApproved) {
    throw new ApiError(403, "Your clinic is not yet approved by admin");
  }

  const existing = await findUserByEmail(payload.email);
  if (existing) throw new ApiError(409, "A user with this email already exists");

  const hashedPassword = await hashPassword(payload.password);

  const { user, receptionist } = await createReceptionistWithUser({
    userData: { ...payload, password: hashedPassword },
    clinicId: clinic.id,
  });

  const { password, refreshToken, ...safeUser } = user;
  return { user: safeUser, receptionist };
};

export const listMyDoctors = async (clinicUserId) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return findDoctorsByClinic(clinic.id);
};

export const listMyReceptionists = async (clinicUserId) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return findReceptionistsByClinic(clinic.id);
};

export const assignDoctorsToReceptionistForClinic = async (
  clinicUserId,
  { receptionistId, doctorIds }
) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const receptionist = await findReceptionistById(receptionistId);
  if (!receptionist || receptionist.clinicId !== clinic.id) {
    throw new ApiError(404, "Receptionist not found in your clinic");
  }

  for (const doctorId of doctorIds) {
    const doctor = await findDoctorById(doctorId);
    if (!doctor || doctor.clinicId !== clinic.id) {
      throw new ApiError(400, `Doctor ${doctorId} does not belong to your clinic`);
    }
  }

  return assignDoctorsToReceptionist(receptionistId, doctorIds);
};

export const getMyAssignedDoctors = async (receptionistUserId) => {
  const receptionist = await findAssignedDoctorsForReceptionistUser(receptionistUserId);
  if (!receptionist) throw new ApiError(404, "Receptionist profile not found");

  return receptionist.assignedDoctors.map((rd) => ({
    doctorId: rd.doctor.id,
    name: rd.doctor.user.name,
    specialization: rd.doctor.specialization,
  }));
};

export const changeStaffPassword = async (clinicUserId, { userId, newPassword }) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const staffRole = await findDoctorOrReceptionistUser(userId, clinic.id);
  if (!staffRole) {
    throw new ApiError(404, "Doctor or Receptionist not found in your clinic");
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(userId, hashedPassword);
};