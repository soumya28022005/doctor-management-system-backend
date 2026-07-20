# MedConnect Backend API 🩺

A robust, full-stack clinic appointment and doctor management system designed to handle real-time patient queues, multi-role access control, and seamless clinic operations.

---

## 🛠 Tech Stack & Architecture

### **Core Stack**
* **Backend Framework:** Node.js, Express.js
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Real-time Communication:** Socket.io
* **Caching:** Redis

### **Security & Authentication**
* **Authentication:** JWT, Refresh Tokens, HTTP-Only Cookies, Google OAuth
* **Validation:** Zod
* **Security Middleware:** Helmet, CORS, Rate Limiter, Data Sanitization
* **Utilities:** Cookie Parser, Compression

### **Integrations & Services**
* **File Uploads:** Multer, Cloudinary
* **Email Services:** Nodemailer
* **PDF Generation:** PDFKit
* **Task Scheduling:** node-cron

### **DevOps, Testing & Docs**
* **Testing:** Jest, Supertest
* **Containerization:** Docker, Docker Compose
* **Documentation:** Swagger (OpenAPI)
* **Logging:** Pino

---

## 🚀 Current Project Status

### ✅ Fully Built and Tested Features
* **Authentication:** Complete flow with registration, login, JWT/refresh tokens, logout, and forgot-password OTP (via email).
* **Role-Based Access Control (RBAC):** Comprehensive support for all 6 core roles.
* **Clinic Operations:** Clinic, Doctor, and Receptionist management, including receptionist ↔ doctor assignment.
* **Admin Controls:** Clinic approval, doctor verification, user management, and global platform settings.
* **Patient Management:** Support for both guest patients (walk-ins) and self-registered patients.
* **Appointment & Queue System:** 
  * Online and in-person reception booking.
  * Shared sequential token queue.
  * Advanced Queue Controls: Next, Previous, Skip, Recall, Pause, Resume, Close, Reopen, and Emergency modes (backed by audit logs).
* **Booking Rules:** Configurable booking-window rules managed by Super Admin.
* **Live Announcements:** Platform-wide, clinic-specific, and doctor-tied announcements broadcasted live via Socket.io.

---

### 🟡 Work in Progress / Needs Implementation
* **Google OAuth:** Documented as a login method, but currently only email/password is implemented.
* **Multi-Clinic Doctors:** Schema currently ties one Doctor record to exactly one Clinic (1-to-1). Needs restructuring to allow doctors to work across multiple clinics with a shared profile.
* **Queue Modes:** `queueMode` field exists (LIVE/PRIVATE/TIME_SLOT), but all queues currently default to "Live Queue" behavior. Private and Time Slot features are pending.
* **Clinic Operational Settings:** Toggles for working hours, holiday configurations, and enabling/disabling online consultations are not yet built.
* **Reporting Module:** Daily/monthly clinic reports and PDF exports are pending.
* **Rate Limiting:** `rateLimiter.middleware.js` is wired up, but the actual rate limiting logic is not yet applied to the routes. 
* **API Documentation:** Swagger integration is not yet started.
* **Deployment:** Dockerization and deployment pipelines (Phase 7) are pending.

---

### ❌ Explicitly Skipped Features
* **Prescription Module**
* **Pharmacy Module**

---

### 🔵 Future Scope (Low Priority)
* **Authentication:** OTP delivery via SMS and WhatsApp.
* **Expansion Modules:** Telemedicine, Payments, Insurance processing, and Laboratory integration.
* **Advanced Features:** AI integrations, multi-branch support, and multi-language localization.

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <soumya28022005/doctor-management-system-backend>
   cd soumya28022005/doctor-management-system-backend