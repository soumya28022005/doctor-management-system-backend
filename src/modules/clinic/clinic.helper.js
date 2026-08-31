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
  
  // Local date extract kora
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayDateString = `${year}-${month}-${day}`;
  
  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDay = daysOfWeek[now.getDay()];

  // 1. Holiday Check
  const isHoliday = clinic.holidays?.some((holiday) => {
    const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
    return holidayDate === todayDateString;
  });

  if (isHoliday) {
    return { isAvailable: false, status: 'Holiday • Closed' };
  }

  // 2. Manual On/Off Toggle Check
  if (clinic.isAvailableToday === false) {
    return { isAvailable: false, status: 'Closed Currently' };
  }

  // 3. Day Schedule Check
  const todaySchedule = clinic.workingHours?.find(
    (sch) => sch.dayOfWeek.toUpperCase() === currentDay
  );

  if (!todaySchedule || todaySchedule.isClosed) {
    return { isAvailable: false, status: 'Closed Today' };
  }

  // 4. Strict Time Check (Current Time vs Open/Close Time)
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`; // E.g., "14:30"

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