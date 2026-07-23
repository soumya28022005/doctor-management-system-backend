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