import * as locationService from './location.service.js';
import  asyncHandler  from '../../utils/asyncHandler.js';

export const getLocations = asyncHandler(async (req, res) => {
  const locations = await locationService.getAllLocations();
  
  // ApiResponse ক্লাস ব্যবহার না করে সরাসরি JSON অবজেক্ট পাঠানো হচ্ছে
  return res.status(200).json({
    success: true,
    data: locations,
    message: "Locations fetched successfully"
  });
});

export const createLocation = asyncHandler(async (req, res) => {
  const location = await locationService.addLocation(req.body);
  
  // ApiResponse ক্লাস ব্যবহার না করে সরাসরি JSON অবজেক্ট পাঠানো হচ্ছে
  return res.status(201).json({
    success: true,
    data: location,
    message: "Location added successfully"
  });
});