import { z } from "zod";

export const searchDoctorsSchema = z.object({
  doctorName: z.string().optional(),
  clinicName: z.string().optional(),
  clinicId: z.string().uuid().optional(),
  city: z.string().optional(),
  date: z.string().optional(), // YYYY-MM-DD, used with clinicId to show who's sitting that day
});

export const bookOnlineAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
});

export const bookReceptionAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  bookingSource: z.enum(["RECEPTION", "WALK_IN", "PHONE"]).default("RECEPTION"),

  // Existing patient path
  patientId: z.string().uuid().optional(),

  // New offline/walk-in patient path (per your spec: just Name + Age, no full account)
  newPatient: z
    .object({
      name: z.string().min(2, "Name is required"),
      age: z.number().int().positive("Age is required"),
      phone: z.string().optional(),
    })
    .optional(),
}).refine((data) => data.patientId || data.newPatient, {
  message: "Either patientId or newPatient details must be provided",
});