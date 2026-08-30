import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as patientService from "./patient.service.js";
import prisma from "../../config/db.config.js";
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

export const searchByPhone = asyncHandler(async (req, res) => {
  const { phone } = req.query;
  
  if (!phone) {
    return res.status(400).json(new ApiResponse(false, "Phone number is required"));
  }

  // Assuming your database has a 'user' table that links to 'patient' role
  const patientUser = await prisma.user.findFirst({
    where: { 
      phone: phone, 
      role: "PATIENT" 
    },
    include: {
      patient: true // Adjust this include based on your Prisma schema (e.g., patientProfile, patient, etc.)
    }
  });

  if (!patientUser) {
    return res.status(200).json(new ApiResponse(true, "No patient found", { patient: null }));
  }

  res.status(200).json(new ApiResponse(true, "Patient found", { patient: patientUser }));
});
