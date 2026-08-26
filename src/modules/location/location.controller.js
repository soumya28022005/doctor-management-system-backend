import * as locationService from './location.service.js';
// Remove the curly braces {} to use default imports
import asyncHandler from '../../utils/asyncHandler.js'; 
import ApiResponse from '../../utils/apiResponse.js';   

export const createLocation = asyncHandler(async (req, res) => {
  const location = await locationService.addLocation(req.body);
  res.status(201).json(new ApiResponse(201, location, 'Search location added successfully'));
});

export const getLocations = asyncHandler(async (req, res) => {
  const locations = await locationService.fetchLocations();
  res.status(200).json(new ApiResponse(200, locations, 'Locations fetched successfully'));
});