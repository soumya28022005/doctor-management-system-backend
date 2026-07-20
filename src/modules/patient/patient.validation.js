import { z } from "zod";

export const searchPatientSchema = z.object({
  phone: z.string().min(4, "Phone number is required"),
});

// Receptionist quick-add: guest patient, no login account created
export const createGuestPatientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.number().int().positive("Age is required"),
  phone: z.string().min(4, "Phone number is required").optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

export const updatePatientProfileSchema = z.object({
  name: z.string().min(2).optional(),
  dob: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});