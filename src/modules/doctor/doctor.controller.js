import prisma from "../../config/db.config.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import * as doctorService from "./doctor.service.js";
import * as clinicController from "../clinic/clinic.controller.js";

import {
  searchDoctorsByNameSchema,
  sendRequestToDoctorSchema,
  sendRequestToClinicSchema,
  respondToRequestSchema,
  advancedSearchSchema,
  updateConsultationTimeSchema,
  markLeaveSchema,
  delayNotificationSchema,
  createScheduleSchema,
  updateScheduleSchema,
} from "./doctor.validation.js";

// ==========================================================
// SEARCH DOCTOR BY NAME
// ==========================================================

export const searchByName = asyncHandler(async (req, res) => {
  const { name } = searchDoctorsByNameSchema.parse(req.query);

  const doctors = await doctorService.searchByName(name);

  res.status(200).json(
    new ApiResponse(
      true,
      "Doctors fetched",
      { doctors }
    )
  );
});

// ==========================================================
// SEND REQUEST TO DOCTOR
// ==========================================================

export const sendRequestToDoctor = asyncHandler(async (req, res) => {
  const data = sendRequestToDoctorSchema.parse(req.body);

  const result = await doctorService.sendRequestToDoctor(
    req.user.id,
    data
  );

  res.status(201).json(
    new ApiResponse(
      true,
      "Request sent to doctor",
      result
    )
  );
});

// ==========================================================
// SEND REQUEST TO CLINIC
// ==========================================================

export const sendRequestToClinic = asyncHandler(async (req, res) => {
  const data = sendRequestToClinicSchema.parse(req.body);

  const result = await doctorService.sendRequestToClinic(
    req.user.id,
    data
  );

  res.status(201).json(
    new ApiResponse(
      true,
      "Request sent to clinic",
      result
    )
  );
});

// ==========================================================
// RESPOND TO CLINIC REQUEST
// ==========================================================

export const respondToClinicRequest = asyncHandler(async (req, res) => {
  const { action } = respondToRequestSchema.parse(req.body);

  const association =
    await doctorService.respondToClinicRequest(
      req.user.id,
      req.params.associationId,
      action
    );

  res.status(200).json(
    new ApiResponse(
      true,
      `Request ${
        action === "ACCEPT"
          ? "approved"
          : "rejected"
      }`,
      { association }
    )
  );
});

// ==========================================================
// RECEIVED REQUESTS
// ==========================================================

export const getMyReceivedRequests = asyncHandler(
  async (req, res) => {
    const requests =
      await doctorService.getMyReceivedRequests(
        req.user.id
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Received requests fetched",
        { requests }
      )
    );
  }
);

// ==========================================================
// SENT REQUESTS
// ==========================================================

export const getMySentRequests = asyncHandler(
  async (req, res) => {
    const requests =
      await doctorService.getMySentRequests(
        req.user.id
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Sent requests fetched",
        { requests }
      )
    );
  }
);

// ==========================================================
// CANCEL ASSOCIATION
// ==========================================================

export const cancelAssociation = asyncHandler(
  async (req, res) => {
    const association =
      await doctorService.cancelAssociation(
        req.user.id,
        req.user.role,
        req.params.associationId
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Association cancelled",
        { association }
      )
    );
  }
);

// ==========================================================
// UPLOAD PROFILE PHOTO
// ==========================================================

export const uploadProfilePhoto = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      throw new ApiError(
        400,
        "No image file provided"
      );
    }

    const doctor =
      await doctorService.uploadProfilePhoto(
        req.user.id,
        req.file.buffer
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Profile photo uploaded",
        { doctor }
      )
    );
  }
);

// ==========================================================
// UPDATE CONSULTATION TIME
// ==========================================================

export const updateConsultationTime =
  asyncHandler(async (req, res) => {
    const {
      avgConsultationMinutes,
    } =
      updateConsultationTimeSchema.parse(
        req.body
      );

    const result =
      await doctorService.updateConsultationTime(
        req.user,
        req.params.doctorId,
        req.params.clinicId,
        avgConsultationMinutes
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Consultation time updated",
        { result }
      )
    );
  });

// ==========================================================
// MARK LEAVE
// ==========================================================

export const markLeave = asyncHandler(
  async (req, res) => {
    const {
      date,
      reason,
    } =
      markLeaveSchema.parse(req.body);

    const leave =
      await doctorService.markDoctorOnLeave(
        req.user,
        req.params.doctorId,
        req.params.clinicId,
        date,
        reason
      );

    res.status(201).json(
      new ApiResponse(
        true,
        "Doctor marked on leave",
        { leave }
      )
    );
  }
);

// ==========================================================
// CANCEL LEAVE
// ==========================================================

export const cancelLeave = asyncHandler(
  async (req, res) => {
    await doctorService.cancelDoctorLeave(
      req.user,
      req.params.doctorId,
      req.params.clinicId,
      req.query.date
    );

    res.status(200).json(
      new ApiResponse(
        true,
        "Leave cancelled"
      )
    );
  }
);

// ==========================================================
// LIST LEAVES
// ==========================================================

export const listLeaves = asyncHandler(
  async (req, res) => {
    const leaves =
      await doctorService.listUpcomingDoctorLeaves(
        req.params.doctorId,
        req.params.clinicId
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Upcoming leaves fetched",
        { leaves }
      )
    );
  }
);

// ==========================================================
// NOTIFY DELAY
// ==========================================================

export const notifyDelay = asyncHandler(
  async (req, res) => {
    const {
      delayMinutes,
    } =
      delayNotificationSchema.parse(
        req.body
      );

    const result =
      await doctorService.notifyDoctorDelay(
        req.user,
        req.params.doctorId,
        req.params.clinicId,
        delayMinutes
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Delay notification sent",
        result
      )
    );
  }
);

// ==========================================================
// PUBLIC: ALL DOCTORS
// ==========================================================

export const getAllDoctors = asyncHandler(
  async (req, res) => {
    const doctors =
      await doctorService.fetchAllDoctors();

    res.status(200).json(
      new ApiResponse(
        true,
        "All doctors fetched successfully",
        doctors
      )
    );
  }
);

// ==========================================================
// PUBLIC: FEATURED DOCTORS
// ==========================================================

export const getFeaturedDoctors = asyncHandler(
  async (req, res) => {
    const doctors =
      await doctorService.fetchFeaturedDoctors();

    res.status(200).json(
      new ApiResponse(
        true,
        "Featured doctors fetched successfully",
        doctors
      )
    );
  }
);

// ==========================================================
// PUBLIC: AVAILABLE DOCTORS
// ==========================================================

export const getAvailableDoctors = asyncHandler(
  async (req, res) => {
    const doctors =
      await doctorService.fetchAvailableDoctors();

    res.status(200).json(
      new ApiResponse(
        true,
        "Available doctors fetched successfully",
        doctors
      )
    );
  }
);

// ==========================================================
// ADMIN: TOGGLE FEATURED STATUS
// ==========================================================

export const toggleDoctorFeaturedStatus =
  asyncHandler(async (req, res) => {
    const {
      doctorId,
    } = req.params;

    const {
      isFeatured,
      featuredOrder,
    } = req.body;

    try {
      const updatedDoctor =
        await doctorService.updateFeaturedStatus(
          doctorId,
          isFeatured,
          featuredOrder
        );

      res.status(200).json(
        new ApiResponse(
          true,
          "Doctor featured status updated",
          updatedDoctor
        )
      );
    } catch (error) {
      const statusCode =
        error.message ===
        "Doctor not found"
          ? 404
          : 500;

      throw new ApiError(
        statusCode,
        error.message
      );
    }
  });

// ==========================================================
// TOGGLE DOCTOR AVAILABILITY
// ==========================================================

export const toggleDoctorAvailability =
  asyncHandler(async (req, res) => {
    const {
      doctorId,
    } = req.params;

    const {
      isAvailable,
    } = req.body;

    const userId =
      req.user.id;

    const userRole =
      req.user.role;

    try {
      const updatedDoctor =
        await doctorService.updateAvailabilityStatus(
          doctorId,
          isAvailable,
          userId,
          userRole
        );

      res.status(200).json(
        new ApiResponse(
          true,
          "Doctor availability updated successfully",
          updatedDoctor
        )
      );
    } catch (error) {
      let statusCode = 500;

      if (
        error.message ===
        "Doctor not found"
      ) {
        statusCode = 404;
      }

      if (
        error.message.includes(
          "Access Denied"
        )
      ) {
        statusCode = 403;
      }

      throw new ApiError(
        statusCode,
        error.message
      );
    }
  });

// ==========================================================
// GET DOCTOR BY ID
// ==========================================================

export const getDoctorById =
  asyncHandler(async (req, res) => {
    const {
      id,
    } = req.params;

    const location =
      req.query.location;

    const doctor =
      await doctorService.getDoctorProfileWithClinics(
        id,
        location
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Doctor profile fetched successfully",
        doctor
      )
    );
  });

// ==========================================================
// ADD SCHEDULE
// ==========================================================

export const addSchedule =
  asyncHandler(async (req, res) => {
    const data =
      createScheduleSchema.parse(
        req.body
      );

    const schedule =
      await doctorService.addSchedule(
        req.user,
        req.params.doctorId,
        req.params.clinicId,
        data
      );

    res.status(201).json(
      new ApiResponse(
        true,
        "Schedule created successfully",
        { schedule }
      )
    );
  });

// ==========================================================
// UPDATE SCHEDULE
// ==========================================================

export const updateSchedule =
  asyncHandler(async (req, res) => {
    const data =
      updateScheduleSchema.parse(
        req.body
      );

    const schedule =
      await doctorService.editSchedule(
        req.user,
        req.params.doctorId,
        req.params.clinicId,
        req.params.scheduleId,
        data
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Schedule updated successfully",
        { schedule }
      )
    );
  });

// ==========================================================
// DELETE SCHEDULE
// ==========================================================

export const deleteSchedule =
  asyncHandler(async (req, res) => {
    await doctorService.removeSchedule(
      req.user,
      req.params.doctorId,
      req.params.clinicId,
      req.params.scheduleId
    );

    res.status(200).json(
      new ApiResponse(
        true,
        "Schedule deleted successfully"
      )
    );
  });

// ==========================================================
// GET SCHEDULES
//
// IMPORTANT DATE FIX
//
// Calendar date must remain EXACTLY the same.
//
// Example:
//
// Frontend:
// 2026-09-28
//
// Backend:
// 2026-09-28
//
// NOT:
// 2026-09-29
//
// NEVER use:
// new Date("2026-09-28")
//
// NEVER use:
// toISOString() to determine calendar date.
// ==========================================================

export const getSchedules =
  asyncHandler(async (req, res) => {

    const {
      doctorId,
      clinicId,
    } = req.params;

    const {
      date,
    } = req.query;

    // ======================================================
    // 1. GET ALL SCHEDULES
    // ======================================================

    const allSchedules =
      await doctorService.listSchedules(
        doctorId,
        clinicId
      );

    const activeSchedules =
      allSchedules.filter(
        (schedule) =>
          schedule.isActive
      );

    // ======================================================
    // 2. NO DATE
    // ======================================================

    if (!date) {
      return res.status(200).json(
        new ApiResponse(
          true,
          "Schedules fetched successfully",
          {
            schedules:
              activeSchedules,
          }
        )
      );
    }

    // ======================================================
    // 3. STRICT DATE FORMAT VALIDATION
    // ======================================================

    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(
        date
      )
    ) {
      throw new ApiError(
        400,
        "Invalid date. Expected format YYYY-MM-DD"
      );
    }

    // ======================================================
    // 4. EXTRACT DATE PARTS
    //
    // DO NOT USE new Date(date)
    // ======================================================

    const [
      year,
      month,
      day,
    ] =
      date
        .split("-")
        .map(Number);

    // ======================================================
    // 5. VALIDATE DATE VALUES
    // ======================================================

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      throw new ApiError(
        400,
        "Invalid date"
      );
    }

    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw new ApiError(
        400,
        "Invalid calendar date"
      );
    }

    // ======================================================
    // 6. CREATE LOCAL CALENDAR DATE
    //
    // new Date(year, month - 1, day)
    //
    // This keeps calendar values local.
    // ======================================================

    const targetDate =
      new Date(
        year,
        month - 1,
        day
      );

    // ======================================================
    // 7. STRICT CALENDAR VALIDATION
    // ======================================================

    if (
      targetDate.getFullYear() !==
        year ||
      targetDate.getMonth() !==
        month - 1 ||
      targetDate.getDate() !==
        day
    ) {
      throw new ApiError(
        400,
        "Invalid calendar date"
      );
    }

    // ======================================================
    // 8. KEEP ORIGINAL DATE STRING
    //
    // VERY IMPORTANT
    //
    // DO NOT:
    //
    // targetDate.toISOString().split("T")[0]
    //
    // ======================================================

    const targetDateString =
      date;

    // ======================================================
    // 9. DAY INFORMATION
    // ======================================================

    const dayNames = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    const targetDayName =
      dayNames[
        targetDate.getDay()
      ];

    const targetDateNum =
      targetDate.getDate();

    // ======================================================
    // 10. FULL DAY RANGE
    //
    // Selected date:
    //
    // 2026-09-28
    //
    // Start:
    // 2026-09-28 00:00:00
    //
    // End:
    // 2026-09-28 23:59:59.999
    // ======================================================

    const startOfDay =
      new Date(
        year,
        month - 1,
        day,
        0,
        0,
        0,
        0
      );

    const endOfDay =
      new Date(
        year,
        month - 1,
        day,
        23,
        59,
        59,
        999
      );

    // ======================================================
    // 11. ORDINAL DATE HELPER
    // ======================================================

    const getOrdinalData =
      (selectedDate) => {

        const dateNumber =
          selectedDate.getDate();

        const weekNth =
          Math.ceil(
            dateNumber / 7
          );

        const lastDayOfMonth =
          new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            0
          ).getDate();

        const isLast =
          dateNumber + 7 >
          lastDayOfMonth;

        return {
          weekNth,
          isLast,
          dayName:
            dayNames[
              selectedDate.getDay()
            ],
        };
      };

    // ======================================================
    // 12. FILTER VALID SCHEDULES
    // ======================================================

    const validSchedules =
      activeSchedules.filter(
        (schedule) => {

          const type =
            schedule.recurrenceType;

          const pattern =
            schedule.recurrencePattern ||
            {};

          // ==================================================
          // EXCLUDED DATES
          // ==================================================

          if (
            Array.isArray(
              pattern.excludedDates
            ) &&
            pattern.excludedDates.includes(
              targetDateString
            )
          ) {
            return false;
          }

          // ==================================================
          // SPECIFIC DATE
          // ==================================================

          if (
            type ===
            "SPECIFIC_DATE"
          ) {
            return (
              pattern.exactDate ===
              targetDateString
            );
          }

          // ==================================================
          // DAILY
          // ==================================================

          if (
            type ===
            "DAILY"
          ) {
            return true;
          }

          // ==================================================
          // WEEKLY
          // ==================================================

          if (
            type ===
            "WEEKLY"
          ) {
            return (
              Array.isArray(
                pattern.days
              ) &&
              pattern.days.includes(
                targetDayName
              )
            );
          }

          // ==================================================
          // MONTHLY DATE
          // ==================================================

          if (
            type ===
            "MONTHLY_DATE"
          ) {
            return (
              Number(
                pattern.date
              ) ===
              targetDateNum
            );
          }

          // ==================================================
          // MONTHLY WEEKDAY
          // ==================================================

          if (
            type ===
            "MONTHLY_WEEKDAY"
          ) {

            const {
              weekNth,
              isLast,
              dayName,
            } =
              getOrdinalData(
                targetDate
              );

            // Wrong weekday
            if (
              pattern.day !==
              dayName
            ) {
              return false;
            }

            // Last weekday
            if (
              pattern.isLast &&
              isLast
            ) {
              return true;
            }

            // Specific week
            if (
              Number(
                pattern.week
              ) ===
              weekNth
            ) {
              return true;
            }

            return false;
          }

          return false;
        }
      );

    // ======================================================
    // 13. GET LIVE CAPACITY
    // ======================================================

    const schedulesWithCapacity =
      await Promise.all(
        validSchedules.map(
          async (schedule) => {

            // =================================================
            // IMPORTANT:
            //
            // OLD:
            //
            // date: new Date(date)
            //
            // NEW:
            //
            // Full selected-day range
            // =================================================

            const queue =
              await prisma.queue.findFirst(
                {
                  where: {

                    doctorId,

                    clinicId,

                    scheduleId:
                      schedule.id,

                    date: {
                      gte:
                        startOfDay,

                      lte:
                        endOfDay,
                    },
                  },
                }
              );

            // =================================================
            // COUNT BOOKINGS
            // =================================================

            let currentBookings = 0;

            if (queue) {

              currentBookings =
                await prisma.appointment.count(
                  {
                    where: {

                      queueId:
                        queue.id,

                      status: {
                        in: [
                          "WAITING",
                          "CHECKED_IN",
                          "COMPLETED",
                        ],
                      },

                    },
                  }
                );
            }

            // =================================================
            // RETURN SCHEDULE
            // =================================================

            return {

              ...schedule,

              currentBookings,

              slotsLeft:
                Math.max(
                  0,
                  schedule.maxPatients -
                    currentBookings
                ),
            };
          }
        )
      );

    // ======================================================
    // 14. RESPONSE
    // ======================================================

    return res.status(200).json(
      new ApiResponse(
        true,
        "Schedules fetched successfully",
        {
          schedules:
            schedulesWithCapacity,
        }
      )
    );
  });

// ==========================================================
// ADVANCED SEARCH
// ==========================================================

export const advancedSearch =
  asyncHandler(async (req, res) => {

    const filters =
      advancedSearchSchema.parse(
        req.query
      );

    const doctors =
      await doctorService.searchDoctorsAdvanced(
        filters
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Advanced search completed",
        {
          doctors,
        }
      )
    );
  });

// ==========================================================
// SEARCH DOCTOR BY EMAIL
// ==========================================================

export const searchDoctorByEmail =
  asyncHandler(async (req, res) => {

    const {
      email,
    } = req.query;

    // ======================================================
    // NO EMAIL
    // ======================================================

    if (!email) {
      return res.status(200).json(
        new ApiResponse(
          true,
          "No email provided",
          {
            doctors: [],
          }
        )
      );
    }

    // ======================================================
    // FIND DOCTOR
    // ======================================================

    const doctors =
      await prisma.doctor.findMany(
        {
          where: {

            user: {

              email: {
                equals:
                  email,

                mode:
                  "insensitive",
              },

            },

          },

          include: {

            user: {

              select: {

                name: true,

                email: true,

                phone: true,

                avatar: true,

              },

            },

          },

        }
      );

    // ======================================================
    // RESPONSE
    // ======================================================

    res.status(200).json(
      new ApiResponse(
        true,
        "Doctor search successful",
        {
          doctors,
        }
      )
    );
  });