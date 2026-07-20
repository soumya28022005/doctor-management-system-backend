import prisma from "../../config/db.config.js";

// Search covers BOTH: guest patients (phone stored directly on Patient)
// and self-registered patients (phone stored on their User)
export const findPatientByPhone = (phone) => {
  return prisma.patient.findFirst({
    where: {
      OR: [{ phone }, { user: { phone } }],
    },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });
};

export const findPatientByUserId = (userId) => {
  return prisma.patient.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });
};

export const findPatientById = (id) => {
  return prisma.patient.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });
};

// Guest patient — NO User row created at all, just a standalone Patient record
export const createGuestPatient = ({ name, age, phone, gender }) => {
  return prisma.patient.create({
    data: { name, age, phone, gender },
  });
};

export const updatePatientProfile = (userId, { name, dob, gender, bloodGroup, address, latitude, longitude }) => {
  return prisma.$transaction(async (tx) => {
    if (name) {
      await tx.user.update({ where: { id: userId }, data: { name } });
    }

    const patient = await tx.patient.update({
      where: { userId },
      data: { dob: dob ? new Date(dob) : undefined, gender, bloodGroup, address, latitude, longitude },
    });

    return patient;
  });
};