import ApiError from "../../utils/apiError.js";
import {
  findPatientByPhone,
  findPatientByUserId,
  createGuestPatient,
  updatePatientProfile,
} from "./patient.repository.js";

export const searchPatientByPhone = async (phone) => {
  const patient = await findPatientByPhone(phone);
  if (!patient) return null;

  // Present a unified shape regardless of guest vs self-registered
  return {
    id: patient.id,
    name: patient.user?.name || patient.name,
    phone: patient.user?.phone || patient.phone,
    email: patient.user?.email || null,
    age: patient.age,
    gender: patient.gender,
    isGuest: !patient.userId,
  };
};

export const createGuest = async (payload) => {
  if (payload.phone) {
    const existing = await findPatientByPhone(payload.phone);
    if (existing) {
      throw new ApiError(409, "A patient with this phone number already exists");
    }
  }

  return createGuestPatient(payload);
};

export const getMyProfile = async (userId) => {
  const patient = await findPatientByUserId(userId);
  if (!patient) throw new ApiError(404, "Patient profile not found");
  return patient;
};

export const updateMyProfile = async (userId, data) => {
  const patient = await findPatientByUserId(userId);
  if (!patient) throw new ApiError(404, "Patient profile not found");
  return updatePatientProfile(userId, data);
};