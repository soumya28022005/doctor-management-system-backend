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

// Add or replace the `createUserWithProfile` function in auth.repository.js
export const createUserWithProfile = ({ userData, role, dob, guestPatientId }) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create the App User
    const user = await tx.user.create({ data: userData });

    if (role === "PATIENT") {
      if (guestPatientId) {
        // STEP 9: Link existing Clinic-created Guest Patient to this new App User
        await tx.patient.update({
          where: { id: guestPatientId },
          data: {
            userId: user.id,
            dob: dob ? new Date(dob) : undefined,
          }
        });
      } else {
        // Create an entirely new Patient record
        await tx.patient.create({
          data: {
            userId: user.id,
            dob: dob ? new Date(dob) : undefined,
          }
        });
      }
    }
    
    // (If you have logic for creating other roles like Admin/Super Admin here, keep it)

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