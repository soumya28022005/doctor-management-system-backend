// === NEW: Live & Available Evaluation Engine (Steps 14 & 15) ===

export const getTodayISTDate = () => {
  const now = new Date();
  const timeZone = "Asia/Kolkata";
  const dateString = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return new Date(dateString); // Returns UTC midnight of the local date
};

export const evaluateDoctorStatus = (doctor) => {
  const now = new Date();
  const timeZone = "Asia/Kolkata";

  const todayDateString = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const currentDay = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(now).toUpperCase();
  const currentTime = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);

  let isAvailable = false;
  let isLive = false;
  let reason = "Not Available";
  let activeSchedule = null;
  let currentCapacity = { booked: 0, max: 0 };

  // 1. Clinic Status Check
  if (doctor.clinic?.isAvailableToday === false) {
    return { isAvailable: false, isLive: false, reason: "Clinic Closed", capacity: null };
  }
  const isHoliday = doctor.clinic?.holidays?.length > 0;
  if (isHoliday) {
    return { isAvailable: false, isLive: false, reason: "Clinic Holiday", capacity: null };
  }

  // 2. Doctor Leave Check
  if (doctor.leaves?.length > 0) {
    return { isAvailable: false, isLive: false, reason: "Doctor on Leave", capacity: null };
  }

  // 3. Filter Today's Active Schedules
  const todaysSchedules = (doctor.schedules || []).filter((sch) => {
    if (!sch.isActive) return false;
    if (sch.recurrenceType === "DAILY") return true;
    if (sch.recurrenceType === "WEEKLY" && sch.recurrencePattern?.days?.includes(currentDay)) return true;
    if (sch.recurrenceType === "MONTHLY_DATE") {
      const todayDayNum = parseInt(todayDateString.split("-")[2], 10);
      return sch.recurrencePattern?.date === todayDayNum;
    }
    return false; // Safely ignore complex untracked patterns
  });

  if (todaysSchedules.length === 0) {
    return { isAvailable: false, isLive: false, reason: "No schedule for today", capacity: null };
  }

  // 4. Evaluate Live Status and Capacity
  for (const sch of todaysSchedules) {
    // Count active appointments linked to this specific schedule's queue
    const activeBookings = (doctor.appointments || []).filter(
      (a) => a.queue?.scheduleId === sch.id
    ).length;

    const maxPts = sch.maxPatients || 20;

    // Check if LIVE right now
    if (currentTime >= sch.startTime && currentTime <= sch.endTime) {
      isLive = true;
      activeSchedule = sch;
      currentCapacity = { booked: activeBookings, max: maxPts };
    }

    // Check if AVAILABLE (Has capacity and session hasn't ended)
    if (activeBookings < maxPts && currentTime <= sch.endTime) {
      isAvailable = true;
      // If we aren't live yet, but have a future available schedule today, preview its capacity
      if (!isLive) {
        currentCapacity = { booked: activeBookings, max: maxPts };
      }
    }
  }

  // Determine specific display reason
  if (isLive && !isAvailable) {
    reason = "Full (Live)"; // Rule 35: Full doctor can still be Live
  } else if (isLive && isAvailable) {
    reason = "Live Now";
  } else if (!isLive && isAvailable) {
    reason = "Available Later Today";
  } else {
    reason = "Fully Booked / Session Ended";
  }

  return { isAvailable, isLive, reason, capacity: currentCapacity };
};