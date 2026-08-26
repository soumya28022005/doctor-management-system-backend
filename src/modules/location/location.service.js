import * as locationRepo from './location.repository.js';

export const getAllLocations = async () => {
  // রিপোজিটরি কল করে সব অ্যাক্টিভ লোকেশন রিটার্ন করবে
  return await locationRepo.getActiveSearchLocations();
};

export const addLocation = async (data) => {
  return await locationRepo.createSearchLocation(data);
};

// একদম নিচে এগুলো পেস্ট করুন
export const getAdminLocations = async () => {
  return await locationRepo.getAllSearchLocationsForAdmin();
};

export const toggleLocationStatus = async (id, isActive) => {
  return await locationRepo.updateLocationStatus(id, isActive);
};

export const deleteLocation = async (id) => {
  return await locationRepo.deleteSearchLocation(id);
};