import { z } from "zod";

export const updateClinicProfileSchema = z.object({
  clinicName: z.string().min(2, "Clinic name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export const createDoctorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.number().int().nonnegative().optional(),
  fee: z.number().nonnegative().optional(),
});

export const createReceptionistSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const assignDoctorsSchema = z.object({
  receptionistId: z.string().uuid(),
  doctorIds: z.array(z.string().uuid()).min(1, "At least one doctor is required"),
});

export const changeStaffPasswordSchema = z.object({
  userId: z.string().uuid(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});