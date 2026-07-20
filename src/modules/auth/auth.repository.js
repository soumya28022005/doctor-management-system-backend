import prisma from "../../config/db.config.js";

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = (id) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = (data) => {
  return prisma.user.create({ data });
};

export const createUserWithProfile = ({ userData, role, dob }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });

    if (role === "CLINIC") {
      await tx.clinic.create({
        data: { userId: user.id, clinicName: userData.name },
      });
    }

    if (role === "PATIENT") {
      await tx.patient.create({
        data: { userId: user.id, dob: dob ? new Date(dob) : undefined },
      });
    }

    return user;
  });
};

export const updateUserPassword = (id, password) => {
  return prisma.user.update({ where: { id }, data: { password } });
};

export const updateRefreshToken = (id, refreshToken) => {
  return prisma.user.update({ where: { id }, data: { refreshToken } });
};

export const clearRefreshToken = (id) => {
  return prisma.user.update({ where: { id }, data: { refreshToken: null } });
};