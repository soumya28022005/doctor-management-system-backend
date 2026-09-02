import PDFDocument from "pdfkit";
import { getPeriodLabel } from "../modules/report/report.helper.js";

// Clean duplicate "Dr." / "Dr " from name
const cleanDoctorName = (name) => {
  if (!name) return "Doctor";
  const clean = name.trim().replace(/^(dr\.?\s*)+/i, "").trim();
  return clean ? `Dr. ${clean}` : "Doctor";
};

export const generateReportPDF = (res, filename, reportData) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  const primaryColor = "#1F4E78";
  const onlineColor = "#2B6CB0";
  const walkinColor = "#2F855A";
  const textColor = "#333333";

  // Header Title
  doc.fillColor(primaryColor).fontSize(22).font("Helvetica-Bold").text(reportData.clinicName || "Clinic Report", 40, 40, { align: "center", width: 515 });
  doc.fillColor("#666666").fontSize(10).font("Helvetica").text(`Daily Appointment Report | Date: ${getPeriodLabel(reportData)}`, 40, doc.y + 4, { align: "center", width: 515 });
  
  // Divider line
  const lineY = doc.y + 12;
  doc.moveTo(40, lineY).lineTo(555, lineY).lineWidth(1.5).strokeColor(primaryColor).stroke();

  // Summary Box
  const boxY = lineY + 15;
  doc.rect(40, boxY, 515, 55).fillAndStroke("#FFFFFF", "#E2E8F0");
  doc.rect(40, boxY, 4, 55).fill(primaryColor); 
  
  doc.fillColor(primaryColor).fontSize(15).font("Helvetica-Bold").text(`Total Appointments: ${reportData.totalAppointments}`, 56, boxY + 12);
  
  const totalOnline = reportData.bySource?.ONLINE || 0;
  const totalWalkin = (reportData.bySource?.WALK_IN || 0) + (reportData.bySource?.RECEPTION || 0);
  doc.fillColor("#666666").fontSize(10).font("Helvetica").text(`Online: ${totalOnline} | Walk-in: ${totalWalkin}`, 56, boxY + 32);

  let currentY = boxY + 75;

  // Doctor Sections
  Object.entries(reportData.byDoctor).forEach(([doctorName, stats]) => {
    // Check page space
    if (currentY > 650) {
      doc.addPage();
      currentY = 40;
    }

    // Doctor Header
    doc.fillColor("#1E293B").fontSize(13).font("Helvetica-Bold").text(cleanDoctorName(doctorName), 40, currentY);
    currentY = doc.y + 4;
    
    // Stats Line
    doc.font("Helvetica").fontSize(10).fillColor(textColor).text(`Total: ${stats.totalAppointments}   `, 40, currentY, { continued: true });
    doc.fillColor(onlineColor).text(`Online: ${stats.online}   `, { continued: true });
    doc.fillColor(walkinColor).text(`Walk-in: ${stats.walkin}`);
    currentY = doc.y + 8;

    // Table Header
    doc.rect(40, currentY, 515, 20).fill(primaryColor);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9);
    doc.text("#", 48, currentY + 5, { width: 30 });
    doc.text("Patient Name", 85, currentY + 5, { width: 240 });
    doc.text("Type", 330, currentY + 5, { width: 90 });
    doc.text("Status", 430, currentY + 5, { width: 90 });
    currentY += 20;

    // Table Rows
    stats.patients.forEach((p, idx) => {
      if (currentY > 740) {
        doc.addPage();
        currentY = 40;
      }

      // Alternate row bg
      if (idx % 2 === 0) {
        doc.rect(40, currentY, 515, 20).fill("#F8FAFC");
      }

      doc.fillColor(textColor).font("Helvetica").fontSize(9);
      doc.text(String(idx + 1), 48, currentY + 5, { width: 30 });
      doc.text(p.name, 85, currentY + 5, { width: 240 });

      if (p.type === 'Online') {
        doc.fillColor(onlineColor).font("Helvetica-Bold");
      } else {
        doc.fillColor(walkinColor).font("Helvetica-Bold");
      }
      doc.text(p.type, 330, currentY + 5, { width: 90 });

      doc.fillColor(textColor).font("Helvetica").text(p.status, 430, currentY + 5, { width: 90 });

      // Border line
      doc.rect(40, currentY, 515, 20).lineWidth(0.5).strokeColor("#E2E8F0").stroke();
      currentY += 20;
    });

    currentY += 25; // Space before next doctor
  });

  doc.end();
};

export const generatePatientListPDF = (res, filename, clinicName, patients) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(18).text(`${clinicName} — Patient List`, { align: "center" });
  doc.moveDown();
  doc.fontSize(11).text(`Total Patients: ${patients.length}`);
  doc.moveDown();

  const startX = 40;
  let y = doc.y;
  const rowHeight = 22;

  doc.fontSize(12).font("Helvetica-Bold");
  doc.text("Name", startX, y);
  doc.text("Age", startX + 250, y);
  doc.text("Phone", startX + 330, y);
  y += rowHeight;
  doc.moveTo(startX, y - 5).lineTo(555, y - 5).stroke();

  doc.font("Helvetica").fontSize(11);
  patients.forEach((p) => {
    if (y > 750) {
      doc.addPage();
      y = 40;
    }
    doc.text(p.name || "-", startX, y, { width: 240 });
    doc.text(p.age != null ? String(p.age) : "-", startX + 250, y);
    doc.text(p.phone || "-", startX + 330, y);
    y += rowHeight;
  });

  doc.end();
};

export const generateDoctorPatientListPDF = (res, filename, clinicName, doctorName, date, patients) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(18).text(`${clinicName} — Patient List for ${cleanDoctorName(doctorName)}`, { align: "center" });
  doc.fontSize(11).text(`Date: ${date}`, { align: "center" });
  doc.moveDown();
  doc.fontSize(11).text(`Total Patients: ${patients.length}`);
  doc.moveDown();

  const startX = 40;
  let y = doc.y;
  const rowHeight = 22;

  const formatDob = (dob) => (dob ? new Date(dob).toISOString().split("T")[0] : "-");

  doc.fontSize(12).font("Helvetica-Bold");
  doc.text("Name", startX, y);
  doc.text("Age", startX + 180, y);
  doc.text("DOB", startX + 240, y);
  doc.text("Phone", startX + 340, y);
  y += rowHeight;
  doc.moveTo(startX, y - 5).lineTo(555, y - 5).stroke();

  doc.font("Helvetica").fontSize(11);
  patients.forEach((p) => {
    if (y > 750) {
      doc.addPage();
      y = 40;
    }
    doc.text(p.name || "-", startX, y, { width: 170 });
    doc.text(p.age != null ? String(p.age) : "-", startX + 180, y);
    doc.text(formatDob(p.dob), startX + 240, y);
    doc.text(p.phone || "-", startX + 340, y);
    y += rowHeight;
  });

  doc.end();
};