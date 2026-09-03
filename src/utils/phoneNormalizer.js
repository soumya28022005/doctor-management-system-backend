export const normalizePhone = (phone) => {
  if (!phone) return phone;
  
  // Strip all non-digit characters except '+'
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // If exactly 10 digits and no country code, append +91
  if (cleaned.length === 10 && !cleaned.startsWith("+")) {
    cleaned = `+91${cleaned}`;
  }
  
  return cleaned;
};