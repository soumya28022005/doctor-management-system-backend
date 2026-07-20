import { z } from "zod";

export const queueParamsSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
});

export const recallTokenSchema = z.object({
  token: z.number().int().positive(),
});

export const emergencyTokenSchema = z.object({
  patientId: z.string().uuid(),
});