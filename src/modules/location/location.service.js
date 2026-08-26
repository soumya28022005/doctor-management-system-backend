import * as locationRepository from './location.repository.js';
import ApiError from '../../utils/apiError.js';

export const addLocation = async (body) => {
  const { nameEn, nameBn, nameHi } = body;

  if (!nameEn || !nameBn || !nameHi) {
    throw new ApiError(400, 'All language translations (English, Bengali, Hindi) are required.');
  }

  return await locationRepository.createSearchLocation({ nameEn, nameBn, nameHi });
};

export const fetchLocations = async () => {
  return await locationRepository.getActiveSearchLocations();
};