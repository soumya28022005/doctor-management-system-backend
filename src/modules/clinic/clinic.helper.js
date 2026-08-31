import crypto from "crypto";
import { TEMP_PASSWORD_LENGTH } from "./clinic.constants.js";

export const generateTempPassword = () => {
  return crypto
    .randomBytes(TEMP_PASSWORD_LENGTH)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, TEMP_PASSWORD_LENGTH);
};

// Time take 12-hour (AM/PM) format e dekhabar jonno helper
const formatTime12Hour = (time24) => {
  if (!time24) return null;
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export const evaluateClinicAvailability = (clinic) => {
  const now = new Date();
  
  // 1. Explicitly Force Indian Timezone (Asia/Kolkata)
  const timeZone = 'Asia/Kolkata';

  // Get YYYY-MM-DD in IST
  const todayDateString = new Intl.DateTimeFormat('en-CA', { 
    timeZone, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(now);

  // Get Current Day (MONDAY, TUESDAY) in IST
  const currentDay = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long'
  }).format(now).toUpperCase();

  // Get Current Time (HH:mm) in IST
  const currentTime = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);

  // 2. Holiday Check
  const isHoliday = clinic.holidays?.some((holiday) => {
    // Force holiday date string to match our IST date string format
    const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
    return holidayDate === todayDateString;
  });

  if (isHoliday) {
    return { isAvailable: false, status: 'Holiday • Closed' };
  }

  // 3. Manual On/Off Toggle Check
  if (clinic.isAvailableToday === false) {
    return { isAvailable: false, status: 'Closed Currently' };
  }

  // 4. Day Schedule Check
  const todaySchedule = clinic.workingHours?.find(
    (sch) => sch.dayOfWeek.toUpperCase() === currentDay
  );

  if (!todaySchedule || todaySchedule.isClosed) {
    return { isAvailable: false, status: 'Closed Today' };
  }

  // 5. Strict Time Check (IST Time vs Open/Close Time)
  const openTime = todaySchedule.openTime;
  const closeTime = todaySchedule.closeTime;

  if (openTime && closeTime) {
    if (currentTime < openTime) {
      // Ekhono kholeni
      return { isAvailable: false, status: `Opens at ${formatTime12Hour(openTime)}` };
    }
    if (currentTime > closeTime) {
      // Bondho hoye geche
      return { isAvailable: false, status: 'Closed Now' };
    }
    
    // Time er moddhe ache (Clinic is currently OPEN)
    return { isAvailable: true, status: `Open • Ends at ${formatTime12Hour(closeTime)}` };
  }

  // Jodi kono karone time set na thake kintu Open thake
  return { isAvailable: true, status: 'Open Today' };
};