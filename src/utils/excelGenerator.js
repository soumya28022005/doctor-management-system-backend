import ExcelJS from "exceljs";
import { getPeriodLabel } from "../modules/report/report.helper.js";

export const generateReportExcel = async (res, filename, reportData) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Doctor Appointment Stats");

  // Title
  sheet.mergeCells("A1:F1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `${reportData.clinicName} — Overview Report`;
  titleCell.font = { size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 30;

  // Subtitle
  sheet.mergeCells("A2:F2");
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = `Period: ${getPeriodLabel(reportData)}`;
  subtitleCell.font = { size: 11, color: { argb: "FF666666" } };
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(2).height = 20;

  sheet.addRow([]);

  // Table Headers
  const headerRow = sheet.addRow(["Doctor Name", "Total Appointments", "Online", "Walk-in", "Completed", "Revenue (Rs.)"]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFDDDDDD" } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } }
    };
  });
  headerRow.height = 25;

  // Table Data
  let isEven = false;
  Object.entries(reportData.byDoctor).forEach(([name, stats]) => {
    const row = sheet.addRow([
      name, 
      stats.totalAppointments, 
      stats.online, 
      stats.walkin, 
      stats.completed, 
      stats.revenue
    ]);
    
    row.eachCell((cell, colNumber) => {
      if (isEven) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
      }
      cell.alignment = { horizontal: colNumber === 1 ? "left" : "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } }
      };
    });
    isEven = !isEven;
  });

  // Adjust column widths
  sheet.columns.forEach((col, i) => {
    col.width = i === 0 ? 35 : 20;
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
};