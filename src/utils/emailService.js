import nodemailer from "nodemailer";
import { env } from "../config/env.config.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"Jeet Clinic" <${env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};