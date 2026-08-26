// Import your centralized Prisma client instance instead of creating a new one
import prisma from '../../config/db.config.js'; 

export const createSearchLocation = async (locationData) => {
  return await prisma.searchLocation.create({
    data: locationData,
  });
};

export const getActiveSearchLocations = async () => {
  return await prisma.searchLocation.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
};

// d and p
export const getAllSearchLocationsForAdmin = async () => {
  return await prisma.searchLocation.findMany({ orderBy: { createdAt: 'desc' } });
};

export const updateLocationStatus = async (id, isActive) => {
  return await prisma.searchLocation.update({
    where: { id },
    data: { isActive },
  });
};

export const deleteSearchLocation = async (id) => {
  return await prisma.searchLocation.delete({
    where: { id },
  });
};