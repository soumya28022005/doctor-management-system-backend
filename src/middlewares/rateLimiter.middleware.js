import rateLimit from "express-rate-limit";
import ApiError from "../utils/apiError.js";

// General limiter — applies to all API routes as a baseline
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many requests, please try again later"));
  },
});

// Strict limiter — for sensitive auth endpoints (login, register, forgot-password)
// to prevent brute-force and credential-stuffing attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // only 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many attempts. Please try again after 15 minutes"));
  },
});

// Very strict — specifically for OTP requests, since these trigger real emails/SMS
// and are the most attractive target for abuse (spamming someone's inbox/phone)
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // only 5 OTP requests per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many OTP requests. Please try again after an hour"));
  },
});