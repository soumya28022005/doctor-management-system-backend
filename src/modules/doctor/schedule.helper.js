// Converts "HH:mm" into total minutes for easy comparison
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Returns true if two time ranges on the same day overlap
export const rangesOverlap = (startA, endA, startB, endB) => {
  const sA = toMinutes(startA);
  const eA = toMinutes(endA);
  const sB = toMinutes(startB);
  const eB = toMinutes(endB);

  return sA < eB && sB < eA;
};

// Checks a candidate schedule against a list of existing APPROVED associations.
// Returns the conflicting association if found, otherwise null.
export const findConflict = (candidate, existingApprovedAssociations) => {
  for (const existing of existingApprovedAssociations) {
    if (existing.dayOfWeek !== candidate.dayOfWeek) continue;
    if (rangesOverlap(candidate.startTime, candidate.endTime, existing.startTime, existing.endTime)) {
      return existing;
    }
  }
  return null;
};

// === NEW: Schedule Overlap Checker ===

// Checks if two recurrence patterns intersect
const patternsIntersect = (typeA, patternA, typeB, patternB) => {
  // If either is DAILY, they intersect on some day
  if (typeA === "DAILY" || typeB === "DAILY") return true;

  // If both are WEEKLY, check if they share any days
  if (typeA === "WEEKLY" && typeB === "WEEKLY") {
    const daysA = patternA.days || [];
    const daysB = patternB.days || [];
    return daysA.some((day) => daysB.includes(day));
  }

  // Fallback: assume they might intersect to be safe
  return true; 
};

// Checks a candidate schedule against existing schedules for overlaps
export const checkScheduleConflict = (candidate, existingSchedules) => {
  for (const existing of existingSchedules) {
    if (!existing.isActive) continue;

    // Check time overlap
    if (rangesOverlap(candidate.startTime, candidate.endTime, existing.startTime, existing.endTime)) {
      // Check recurrence pattern overlap
      if (patternsIntersect(candidate.recurrenceType, candidate.recurrencePattern, existing.recurrenceType, existing.recurrencePattern)) {
        return existing;
      }
    }
  }
  return null;
};
