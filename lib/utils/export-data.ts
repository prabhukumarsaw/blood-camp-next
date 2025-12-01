// @ts-nocheck

/**
 * Global Data Export Utility
 * 
 * Provides reusable functions to export table data to CSV and XLS formats
 * Respects current filters or exports all data if no filters applied
 * 
 * Features:
 * - CSV export
 * - XLS export (Excel)
 * - Filter-aware exports
 * - Clean, maintainable code
 */

import * as XLSX from "xlsx";

/**
 * Export data to CSV format
 * 
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param headers - Optional custom headers mapping { key: "Display Name" }
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = "export",
  headers?: Record<keyof T, string>
): void {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object or use provided headers
  const keys = Object.keys(data[0]) as Array<keyof T>;
  const headerLabels = headers
    ? keys.map((key) => headers[key] || String(key))
    : keys.map((key) => String(key).replace(/([A-Z])/g, " $1").trim());

  // Create CSV content
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headerLabels.join(","));

  // Add data rows
  data.forEach((row) => {
    const values = keys.map((key) => {
      const value = row[key];
      // Handle null/undefined
      if (value === null || value === undefined) return "";
      // Handle dates
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      // Handle arrays
      if (Array.isArray(value)) {
        return value.join("; ");
      }
      // Handle objects
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      // Escape commas and quotes in strings
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(","));
  });

  // Create blob and download
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${formatDateForFilename()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to XLS (Excel) format
 * 
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param headers - Optional custom headers mapping { key: "Display Name" }
 * @param sheetName - Name of the Excel sheet (default: "Sheet1")
 */
export function exportToXLS<T extends Record<string, any>>(
  data: T[],
  filename: string = "export",
  headers?: Record<keyof T, string>,
  sheetName: string = "Sheet1"
): void {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  try {
    // Prepare data for Excel
    const keys = Object.keys(data[0]) as Array<keyof T>;
    const headerLabels = headers
      ? keys.map((key) => headers[key] || String(key))
      : keys.map((key) => String(key).replace(/([A-Z])/g, " $1").trim());

    // Create worksheet data
    const worksheetData: any[][] = [];

    // Add header row
    worksheetData.push(headerLabels);

    // Add data rows
    data.forEach((row) => {
      const values = keys.map((key) => {
        const value = row[key];
        // Handle null/undefined
        if (value === null || value === undefined) return "";
        // Handle dates
        if (value instanceof Date) {
          return value;
        }
        // Handle arrays
        if (Array.isArray(value)) {
          return value.join("; ");
        }
        // Handle objects
        if (typeof value === "object") {
          return JSON.stringify(value);
        }
        return value;
      });
      worksheetData.push(values);
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = keys.map((key) => {
      const headerLength = headerLabels[keys.indexOf(key)]?.length || 10;
      const maxDataLength = Math.max(
        ...data.map((row) => {
          const val = row[key];
          return val ? String(val).length : 0;
        })
      );
      return { wch: Math.max(headerLength, maxDataLength, 10) };
    });
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate file and download
    XLSX.writeFile(workbook, `${filename}_${formatDateForFilename()}.xlsx`);
  } catch (error) {
    console.error("Error exporting to XLS:", error);
    alert("Failed to export to Excel. Please try again.");
  }
}

/**
 * Export data to both CSV and XLS formats
 * 
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param headers - Optional custom headers mapping
 */
export function exportToBoth<T extends Record<string, any>>(
  data: T[],
  filename: string = "export",
  headers?: Record<keyof T, string>
): void {
  exportToCSV(data, filename, headers);
  setTimeout(() => {
    exportToXLS(data, filename, headers);
  }, 500);
}

/**
 * Format date for filename (YYYY-MM-DD_HH-MM-SS)
 */
function formatDateForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * Type definitions for export functions
 */
export type ExportFormat = "csv" | "xls" | "both";

export interface ExportOptions<T extends Record<string, any>> {
  data: T[];
  filename?: string;
  headers?: Record<keyof T, string>;
  format?: ExportFormat;
  sheetName?: string;
}

/**
 * Unified export function with options
 * 
 * @param options - Export configuration
 */
export function exportData<T extends Record<string, any>>(options: ExportOptions<T>): void {
  const {
    data,
    filename = "export",
    headers,
    format = "csv",
    sheetName = "Sheet1",
  } = options;

  switch (format) {
    case "csv":
      exportToCSV(data, filename, headers);
      break;
    case "xls":
      exportToXLS(data, filename, headers, sheetName);
      break;
    case "both":
      exportToBoth(data, filename, headers);
      break;
    default:
      exportToCSV(data, filename, headers);
  }
}

