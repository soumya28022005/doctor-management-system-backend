import * as locationService from './location.service.js';
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler  from '../../utils/asyncHandler.js';

export const getLocations = asyncHandler(async (req, res) => {
  const locations = await locationService.getAllLocations();
  
  // ✅ সঠিক অর্ডার: success (true), message, data (locations)
  return res.status(200).json(
    new ApiResponse(true, "Locations fetched successfully", locations)
  );
});

export const createLocation = asyncHandler(async (req, res) => {
  const location = await locationService.addLocation(req.body);
  
  // ✅ সঠিক অর্ডার: success (true), message, data (location)
  return res.status(201).json(
    new ApiResponse(true, "Location added successfully", location)
  );
});

// একদম নিচে এগুলো পেস্ট করুন
export const getAdminLocations = asyncHandler(async (req, res) => {
  const locations = await locationService.getAdminLocations();
  return res.status(200).json(new ApiResponse(true, "Admin locations fetched", locations));
});

export const toggleLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const updated = await locationService.toggleLocationStatus(id, isActive);
  return res.status(200).json(new ApiResponse(true, "Location status updated", updated));
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await locationService.deleteLocation(id);
  return res.status(200).json(new ApiResponse(true, "Location deleted", null));
});