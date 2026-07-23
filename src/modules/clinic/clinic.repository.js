import prisma from "../../config/db.config.js";

export const findClinicByUserId = (userId) => {
  return prisma.clinic.findUnique({ where: { userId } });
};

export const findClinicById = (id) => {
  return prisma.clinic.findUnique({ where: { id } });
};

export const updateClinicProfile = (id, data) => {
  return prisma.clinic.update({ where: { id }, data });
};

export const createDoctorWithUser = ({ userData, doctorData, clinicId }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { ...userData, role: "DOCTOR", selfRegistered: false },
    });

    const doctor = await tx.doctor.create({
      data: { ...doctorData, userId: user.id, clinicId },
    });

    return { user, doctor };
  });
};

export const createReceptionistWithUser = ({ userData, clinicId }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { ...userData, role: "RECEPTIONIST", selfRegistered: false },
    });

    const receptionist = await tx.receptionist.create({
      data: { userId: user.id, clinicId },
    });

    return { user, receptionist };
  });
};

export const findDoctorsByClinic = (clinicId) => {
  return prisma.doctor.findMany({
    where: { clinicId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
    },
  });
};

export const findReceptionistsByClinic = (clinicId) => {
  return prisma.receptionist.findMany({
    where: { clinicId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
      assignedDoctors: {
        include: { doctor: { include: { user: { select: { name: true } } } } },
      },
    },
  });
};

export const findDoctorById = (id) => {
  return prisma.doctor.findUnique({ where: { id } });
};

export const findReceptionistById = (id) => {
  return prisma.receptionist.findUnique({ where: { id } });
};

export const assignDoctorsToReceptionist = (receptionistId, doctorIds) => {
  return prisma.$transaction(async (tx) => {
    await tx.receptionistDoctor.deleteMany({
      where: { receptionistId, doctorId: { notIn: doctorIds } },
    });

    for (const doctorId of doctorIds) {
      await tx.receptionistDoctor.upsert({
        where: { receptionistId_doctorId: { receptionistId, doctorId } },
        update: {},
        create: { receptionistId, doctorId },
      });
    }

    return tx.receptionistDoctor.findMany({
      where: { receptionistId },
      include: { doctor: { include: { user: { select: { name: true } } } } },
    });
  });
};

export const findAssignedDoctorsForReceptionistUser = (userId) => {
  return prisma.receptionist.findUnique({
    where: { userId },
    include: {
      assignedDoctors: {
        include: {
          doctor: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
  });
};

export const findDoctorOrReceptionistUser = async (userId, clinicId) => {
  const doctor = await prisma.doctor.findFirst({ where: { userId, clinicId } });
  if (doctor) return "DOCTOR";

  const receptionist = await prisma.receptionist.findFirst({ where: { userId, clinicId } });
  if (receptionist) return "RECEPTIONIST";

  return null;
};
export const updateDoctor = (id, data) => {
  return prisma.doctor.update({ where: { id }, data });
};
export const searchClinicsByName = (name) => {
  return prisma.clinic.findMany({
    where: {
      isApproved: true,
      clinicName: { contains: name, mode: "insensitive" },
    },
    select: {
      id: true,
      clinicName: true,
      city: true,
      address: true,
      logo: true,
    },
  });
};