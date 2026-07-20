import { z } from "zod";
import { ANNOUNCEMENT_TYPES } from "./announcement.constants.js";

export const createAnnouncementSchema = z.object({
  type: z.enum(ANNOUNCEMENT_TYPES),
  title: z.string().min(2, "Title is required"),
  message: z.string().min(2, "Message is required"),
  doctorId: z.string().uuid().optional(),
});

export const listAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});