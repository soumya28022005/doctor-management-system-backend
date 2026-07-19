import { z } from "zod";

const booleanQueryParam = z
  .enum(["true", "false"])
  .optional()
  .transform((val) => (val === undefined ? undefined : val === "true"));

export const listUsersQuerySchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "CLINIC", "RECEPTIONIST", "DOCTOR", "PATIENT"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const listClinicsQuerySchema = z.object({
  isApproved: booleanQueryParam,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});