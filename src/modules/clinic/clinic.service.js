import * as clinicRepo from "./clinic.repository.js";
import ApiError from "../../utils/apiError.js";
import { hashPassword } from "../auth/auth.helper.js";
import { findUserByEmail, updateUserPassword } from "../auth/auth.repository.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../../utils/cloudinaryUpload.js";
import { respondToDoctorRequest as respondToDoctorRequestCore } from "../doctor/doctor.service.js";
import { findApprovedAssociationsForDoctor } from "../doctor/doctor.repository.js";
import { evaluateClinicAvailability } from "./clinic.helper.js";

export const getMyClinicProfile = async (userId) => {
  const clinic = await clinicRepo.findClinicByUserId(userId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinic;
};

export const updateMyClinicProfile = async (userId, data) => {
  const clinic = await clinicRepo.findClinicByUserId(userId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.updateClinicProfile(clinic.id, data);
};

export const addDoctor = async (clinicUserId, payload) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  if (!clinic.isApproved) throw new ApiError(403, "Your clinic is not yet approved by admin");
  const existing = await findUserByEmail(payload.email);
  if (existing) throw new ApiError(409, "A user with this email already exists");
  const hashedPassword = await hashPassword(payload.password);
  const { specialization, qualification, experience, fee, startTime, ...userFields } = payload;
  const { user, doctor } = await clinicRepo.createDoctorWithUser({ userData: { ...userFields, password: hashedPassword }, doctorData: { specialization, qualification, experience, fee, startTime }, clinicId: clinic.id });
  const { password, refreshToken, ...safeUser } = user;
  return { user: safeUser, doctor };
};

export const editDoctor = async (clinicUserId, doctorId, data) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  const doctor = await clinicRepo.findDoctorById(doctorId);
  if (!doctor || doctor.clinicId !== clinic.id) throw new ApiError(404, "Doctor not found in your clinic");
  return clinicRepo.updateDoctor(doctorId, data);
};

export const addReceptionist = async (clinicUserId, payload) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  if (!clinic.isApproved) throw new ApiError(403, "Your clinic is not yet approved by admin");
  const existing = await findUserByEmail(payload.email);
  if (existing) throw new ApiError(409, "A user with this email already exists");
  const hashedPassword = await hashPassword(payload.password);
  const { user, receptionist } = await clinicRepo.createReceptionistWithUser({ userData: { ...payload, password: hashedPassword }, clinicId: clinic.id });
  const { password, refreshToken, ...safeUser } = user;
  return { user: safeUser, receptionist };
};

export const listMyDoctors = async (clinicUserId) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.findDoctorsByClinic(clinic.id);
};

export const listMyReceptionists = async (clinicUserId) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.findReceptionistsByClinic(clinic.id);
};

export const assignDoctorsToReceptionistForClinic = async (clinicUserId, { receptionistId, doctorIds }) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  const receptionist = await clinicRepo.findReceptionistById(receptionistId);
  if (!receptionist || receptionist.clinicId !== clinic.id) throw new ApiError(404, "Receptionist not found in your clinic");

  for (const doctorId of doctorIds) {
    const doctor = await clinicRepo.findDoctorById(doctorId);
    if (!doctor) throw new ApiError(404, `Doctor ${doctorId} not found`);
    if (doctor.clinicId !== clinic.id) {
      const approvedAssociations = await findApprovedAssociationsForDoctor(doctorId);
      const hasApprovedAssociation = approvedAssociations.some((a) => a.clinicId === clinic.id);
      if (!hasApprovedAssociation) throw new ApiError(400, `Doctor ${doctorId} does not belong to your clinic`);
    }
  }
  return clinicRepo.assignDoctorsToReceptionist(receptionistId, clinic.id, doctorIds);
};

export const getMyAssignedDoctors = async (receptionistUserId) => {
  const receptionist = await clinicRepo.findAssignedDoctorsForReceptionistUser(receptionistUserId);
  if (!receptionist) throw new ApiError(404, "Receptionist profile not found");
  return receptionist.assignedDoctors.map((rd) => ({ doctorId: rd.doctor.id, name: rd.doctor.user.name, specialization: rd.doctor.specialization, clinicId: rd.clinic.id, clinicName: rd.clinic.clinicName }));
};

export const changeStaffPassword = async (clinicUserId, { userId, newPassword }) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  const staffRole = await clinicRepo.findDoctorOrReceptionistUser(userId, clinic.id);
  if (!staffRole) throw new ApiError(404, "Doctor or Receptionist not found in your clinic");
  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(userId, hashedPassword);
};

export const searchByName = async (name) => {
  return clinicRepo.searchClinicsByName(name);
};

export const respondToDoctorRequest = async (clinicUserId, associationId, action) => {
  return respondToDoctorRequestCore(clinicUserId, associationId, action);
};

export const uploadLogo = async (clinicUserId, fileBuffer) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  const oldLogo = clinic.logo;
  const result = await uploadBufferToCloudinary(fileBuffer, "jeet/clinics");
  const updated = await clinicRepo.updateClinicLogo(clinic.id, result.secure_url);
  if (oldLogo) await deleteFromCloudinary(oldLogo);
  return updated;
};

export const setWorkingHours = async (clinicUserId, workingHours) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.upsertWorkingHours(clinic.id, workingHours);
};

export const getWorkingHours = async (clinicUserId) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.findWorkingHours(clinic.id);
};

export const addClinicHoliday = async (clinicUserId, { date, reason }) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  const existing = await clinicRepo.findHolidayForDate(clinic.id, date);
  if (existing) throw new ApiError(409, "A holiday is already set for this date");
  return clinicRepo.addHoliday(clinic.id, date, reason);
};

export const removeClinicHoliday = async (clinicUserId, holidayId) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  const result = await clinicRepo.removeHoliday(clinic.id, holidayId);
  if (result.count === 0) throw new ApiError(404, "Holiday not found");
  return { deleted: true };
};

export const listClinicHolidays = async (clinicUserId) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.findHolidays(clinic.id);
};

export const toggleOnlineConsultation = async (clinicUserId, enabled) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.setOnlineConsultationEnabled(clinic.id, enabled);
};

export const getMyReceivedRequests = async (clinicUserId) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.findReceivedRequestsForClinic(clinic.id);
};

export const toggleAvailability = async (clinicUserId, isAvailableToday) => {
  const clinic = await clinicRepo.findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return clinicRepo.updateClinicAvailability(clinic.id, isAvailableToday);
};

// ==========================================
// PUBLIC SERVICES
// ==========================================

export const fetchAllClinics = async () => {
  const clinics = await clinicRepo.findAllApprovedClinics();
  return clinics.map(clinic => ({
    ...clinic,
    availability: evaluateClinicAvailability(clinic), // Attach calculated status
    doctorsCount: clinic._count.doctors + clinic._count.doctorAssociations,
    _count: undefined
  }));
};

export const fetchFeaturedClinics = async () => {
  const clinics = await clinicRepo.findFeaturedClinics();
  return clinics.map(clinic => ({
    ...clinic,
    availability: evaluateClinicAvailability(clinic), // Attach calculated status
    doctorsCount: clinic._count.doctors + clinic._count.doctorAssociations,
    _count: undefined
  }));
};

export const fetchClinicProfileById = async (id) => {
  const clinic = await clinicRepo.getClinicProfileWithDoctorsRepo(id);
  if (!clinic) throw new ApiError(404, "Clinic not found");

  const primaryDoctors = clinic.doctors.map(doc => ({
    ...doc,
    isPrimary: true,
    associationDetails: { fee: doc.fee, startTime: doc.startTime, queueMode: doc.queueMode }
  }));

  const associatedDoctors = clinic.doctorAssociations.map(assoc => ({
    ...assoc.doctor,
    isPrimary: false,
    associationDetails: {
      fee: assoc.fee,
      dayOfWeek: assoc.dayOfWeek,
      startTime: assoc.startTime,
      endTime: assoc.endTime,
      queueMode: assoc.queueMode
    }
  }));

  return {
    ...clinic,
    availability: evaluateClinicAvailability(clinic), // Attach calculated status
    allDoctors: [...primaryDoctors, ...associatedDoctors]
  };
};

export const toggleFeaturedStatus = async (clinicId, isFeatured, featuredOrder) => {
  const clinicExists = await clinicRepo.findClinicById(clinicId);
  if (!clinicExists) throw new ApiError(404, "Clinic not found");

  return clinicRepo.updateClinicFeaturedStatus(clinicId, {
    isFeatured: isFeatured !== undefined ? isFeatured : clinicExists.isFeatured,
    featuredOrder: featuredOrder !== undefined ? featuredOrder : clinicExists.featuredOrder
  });
};