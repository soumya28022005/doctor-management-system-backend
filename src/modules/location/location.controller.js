import * as locationService from './location.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
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