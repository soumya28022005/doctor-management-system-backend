import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as specializationService from "./specialization.service.js";
import { createSpecializationSchema, updateSpecializationSchema } from "./specialization.validation.js";

export const createSpecialization = asyncHandler(async (req, res) => {
  const data = createSpecializationSchema.parse(req.body);
  const result = await specializationService.addSpecialization(data);
  res.status(201).json(new ApiResponse(true, "Specialization created successfully", result));
});

export const updateSpecialization = asyncHandler(async (req, res) => {
  const data = updateSpecializationSchema.parse(req.body);
  const result = await specializationService.editSpecialization(req.params.id, data);
  res.status(200).json(new ApiResponse(true, "Specialization updated successfully", result));
});

export const getSpecializations = asyncHandler(async (req, res) => {
  const { activeOnly } = req.query; // ?activeOnly=true
  const result = await specializationService.fetchSpecializations(activeOnly === 'true');
  res.status(200).json(new ApiResponse(true, "Specializations fetched", { specializations: result }));
});