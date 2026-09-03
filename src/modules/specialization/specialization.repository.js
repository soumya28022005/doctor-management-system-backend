import prisma from "../../config/db.config.js";

export const createSpecialization = (data) => {
  return prisma.specialization.create({ data });
};

export const updateSpecialization = (id, data) => {
  return prisma.specialization.update({
    where: { id },
    data,
  });
};

export const getAllSpecializations = (onlyActive) => {
  return prisma.specialization.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { name: "asc" },
  });
};

export const findSpecializationById = (id) => {
  return prisma.specialization.findUnique({ where: { id } });
};

export const findSpecializationByName = (name) => {
  return prisma.specialization.findUnique({ where: { name } });
};