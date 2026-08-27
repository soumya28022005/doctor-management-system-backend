import prisma from "../../config/db.config.js";

export const createAnnouncement = (data) => {
  return prisma.announcement.create({
    data,
    include: { doctor: { include: { user: { select: { name: true } } } } },
  });
};

export const findActiveAnnouncementsForClinic = ({ clinicId, page, limit }) => {
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [{ clinicId }, { clinicId: null }],
    },
    include: { doctor: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const findAllPlatformAnnouncements = ({ page, limit }) => {
  return prisma.announcement.findMany({
    where: { isActive: true },
    include: {
      clinic: { select: { clinicName: true } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const findAnnouncementById = (id) => {
  return prisma.announcement.findUnique({ where: { id } });
};

export const deactivateAnnouncement = async (id) => {
  return prisma.announcement.update({
    where: { id },
    data: { isActive: false },
  });
};

export const deleteAnnouncementById = async (id) => {
  return prisma.announcement.delete({
    where: { id },
  });
};

export const updateAnnouncementById = async (id, data) => {
  return prisma.announcement.update({
    where: { id },
    data,
  });
};

export const findAllAnnouncementsForAdmin = async () => {
  return prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
};