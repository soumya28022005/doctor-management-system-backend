import * as locationRepo from './location.repository.js';

export const getAllLocations = async () => {
  // রিপোজিটরি কল করে সব অ্যাক্টিভ লোকেশন রিটার্ন করবে
  return await locationRepo.getActiveSearchLocations();
};

export const addLocation = async (data) => {
  return await locationRepo.createSearchLocation(data);
};