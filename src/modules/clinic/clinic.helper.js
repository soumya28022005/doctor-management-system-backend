import crypto from "crypto";
import { TEMP_PASSWORD_LENGTH } from "./clinic.constants.js";

export const generateTempPassword = () => {
  return crypto
    .randomBytes(TEMP_PASSWORD_LENGTH)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, TEMP_PASSWORD_LENGTH);
};