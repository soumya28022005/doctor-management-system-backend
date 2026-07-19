import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as clinicService from "./clinic.service.js";
import {
  updateClinicProfileSchema,
  createDoctorSchema,
  createReceptionistSchema,
  assignDoctorsSchema,
  changeStaffPasswordSchema,
} from "./clinic.validation.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const clinic = await clinicService.getMyClinicProfile(req.user.id);
  res.status(200).json(new ApiResponse(true, "Clinic profile fetched", { clinic }));
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const data = updateClinicProfileSchema.parse(req.body);
  const clinic = await clinicService.updateMyClinicProfile(req.user.id, data);
  res.status(200).json(new ApiResponse(true, "Clinic profile updated", { clinic }));
});

export const addDoctor = asyncHandler(async (req, res) => {
  const data = createDoctorSchema.parse(req.body);
  const result = await clinicService.addDoctor(req.user.id, data);
  res.status(201).json(new ApiResponse(true, "Doctor created successfully", result));
});

export const addReceptionist = asyncHandler(async (req, res) => {
  const data = createReceptionistSchema.parse(req.body);
  const result = await clinicService.addReceptionist(req.user.id, data);
  res.status(201).json(new ApiResponse(true, "Receptionist created successfully", result));
});

export const listDoctors = asyncHandler(async (req, res) => {
  const doctors = await clinicService.listMyDoctors(req.user.id);
  res.status(200).json(new ApiResponse(true, "Doctors fetched", { doctors }));
});

export const listReceptionists = asyncHandler(async (req, res) => {
  const receptionists = await clinicService.listMyReceptionists(req.user.id);
  res.status(200).json(new ApiResponse(true, "Receptionists fetched", { receptionists }));
});

export const assignDoctorsToReceptionist = asyncHandler(async (req, res) => {
  const data = assignDoctorsSchema.parse(req.body);
  const result = await clinicService.assignDoctorsToReceptionistForClinic(req.user.id, data);
  res
    .status(200)
    .json(new ApiResponse(true, "Doctors assigned successfully", { assignments: result }));
});

export const getMyAssignedDoctors = asyncHandler(async (req, res) => {
  const doctors = await clinicService.getMyAssignedDoctors(req.user.id);
  res.status(200).json(new ApiResponse(true, "Assigned doctors fetched", { doctors }));
});

export const changeStaffPassword = asyncHandler(async (req, res) => {
  const data = changeStaffPasswordSchema.parse(req.body);
  await clinicService.changeStaffPassword(req.user.id, data);
  res.status(200).json(new ApiResponse(true, "Password updated successfully"));
});