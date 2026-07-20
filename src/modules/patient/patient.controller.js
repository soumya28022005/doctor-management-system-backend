import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as patientService from "./patient.service.js";
import {
  searchPatientSchema,
  createGuestPatientSchema,
  updatePatientProfileSchema,
} from "./patient.validation.js";

export const searchPatient = asyncHandler(async (req, res) => {
  const { phone } = searchPatientSchema.parse(req.query);
  const patient = await patientService.searchPatientByPhone(phone);

  if (!patient) {
    return res
      .status(200)
      .json(new ApiResponse(true, "No patient found with this phone number", { patient: null }));
  }

  res.status(200).json(new ApiResponse(true, "Patient found", { patient }));
});

export const createGuestPatient = asyncHandler(async (req, res) => {
  const data = createGuestPatientSchema.parse(req.body);
  const patient = await patientService.createGuest(data);
  res.status(201).json(new ApiResponse(true, "Guest patient created successfully", { patient }));
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const patient = await patientService.getMyProfile(req.user.id);
  res.status(200).json(new ApiResponse(true, "Patient profile fetched", { patient }));
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const data = updatePatientProfileSchema.parse(req.body);
  const patient = await patientService.updateMyProfile(req.user.id, data);
  res.status(200).json(new ApiResponse(true, "Profile updated successfully", { patient }));
});