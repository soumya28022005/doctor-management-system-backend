import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import prisma from "../../config/db.config.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUpload.js";

// Fetch all active specializations
export const getAllSpecializations = asyncHandler(async (req, res) => {
  const specializations = await prisma.specialization.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });
  
  res.status(200).json(new ApiResponse(true, "Specializations fetched", { specializations }));
});

// Admin creates a new specialization with an icon image
export const createSpecialization = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json(new ApiResponse(false, "Name is required"));
  }

  // Check if name already exists
  const existing = await prisma.specialization.findUnique({ where: { name } });
  if (existing) {
    return res.status(400).json(new ApiResponse(false, "This specialization already exists"));
  }

  let iconUrl = null;

  // Upload image to Cloudinary if file is provided
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "jeet/categories");
    iconUrl = result.secure_url;
  }

  const newSpec = await prisma.specialization.create({
    data: { name, description, iconUrl }
  });
  
  res.status(201).json(new ApiResponse(true, "Specialization added successfully", { specialization: newSpec }));
});