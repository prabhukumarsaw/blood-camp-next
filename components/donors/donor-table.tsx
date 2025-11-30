"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, Eye, Edit, CalendarIcon, X, FileDown, Download, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { BloodGroup, DonorStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { DonorCertificate } from "./donor-certificate";

interface Donor {
  id: string;
  donorId: string;
  fullName: string;
  bloodGroup: BloodGroup;
  mobileNumber: string;
  email: string | null;
  aadharNumber?: string | null;
  city: string;
  status: DonorStatus;
  createdAt: Date;
  lastDonationDate: Date | null;
}

interface DonorTableProps {
  donors: Donor[];
  total: number;
  page: number;
  totalPages: number;
  searchParams: {
    search?: string;
    bloodGroup?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    mobileNumber?: string;
    aadharNumber?: string;
  };
}

const BLOOD_GROUP_MAP: Record<BloodGroup, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

export function DonorTable({ donors, total, page, totalPages, searchParams }: DonorTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search || "");
  const [bloodGroup, setBloodGroup] = useState(searchParams.bloodGroup || "all");
  const [status, setStatus] = useState(searchParams.status || "all");
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    searchParams.startDate && searchParams.endDate
      ? {
          from: new Date(searchParams.startDate),
          to: new Date(searchParams.endDate),
        }
      : undefined
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    if (bloodGroup !== "all") params.set("bloodGroup", bloodGroup);
    if (status !== "all") params.set("status", status);
    router.push(`/dashboard/blood-panel?${params.toString()}`);
  };

  const handleFilter = (type: string, value: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type === "bloodGroup") {
      setBloodGroup(value);
      if (value !== "all") params.set("bloodGroup", value);
    }
    if (type === "status") {
      setStatus(value);
      if (value !== "all") params.set("status", value);
    }
    if (dateRange?.from) params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
    router.push(`/dashboard/blood-panel?${params.toString()}`);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (bloodGroup !== "all") params.set("bloodGroup", bloodGroup);
    if (status !== "all") params.set("status", status);
    if (range?.from) params.set("startDate", format(range.from, "yyyy-MM-dd"));
    if (range?.to) params.set("endDate", format(range.to, "yyyy-MM-dd"));
    router.push(`/dashboard/blood-panel?${params.toString()}`);
  };

  const clearDateRange = () => {
    setDateRange(undefined);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (bloodGroup !== "all") params.set("bloodGroup", bloodGroup);
    if (status !== "all") params.set("status", status);
    router.push(`/dashboard/blood-panel?${params.toString()}`);
  };

  // Export functionality
  const handleExport = async (exportFormat: "csv" | "xls") => {
    setIsExporting(true);
    try {
      // Build export parameters matching the server action schema
      const exportParams: any = {
        page: 1,
        pageSize: 10000, // Get all data for export
      };

      if (search) exportParams.search = search;
      if (bloodGroup !== "all") {
        // Validate blood group enum
        const validBloodGroups = Object.keys(BLOOD_GROUP_MAP);
        if (validBloodGroups.includes(bloodGroup)) {
          exportParams.bloodGroup = bloodGroup as BloodGroup;
        }
      }
      if (status !== "all") {
        // Validate status enum
        const validStatuses = ["active", "inactive", "blocked", "suspended"];
        if (validStatuses.includes(status)) {
          exportParams.status = status as DonorStatus;
        }
      }
      if (dateRange?.from) {
        // Format date as YYYY-MM-DD string
        exportParams.startDate = format(dateRange.from, "yyyy-MM-dd");
      }
      if (dateRange?.to) {
        // Format date as YYYY-MM-DD string
        exportParams.endDate = format(dateRange.to, "yyyy-MM-dd");
      }

      // Fetch data using server action
      const { getDonors } = await import("@/lib/actions/donors");
      const result = await getDonors(exportParams);

      if (!result.success || !result.donors) {
        throw new Error(result.error || "Failed to fetch data for export");
      }

      // Prepare data for export
      const dataToExport = result.donors.map((donor: any) => ({
        "Donor ID": donor.donorId,
        "Full Name": donor.fullName,
        "Blood Group": BLOOD_GROUP_MAP[donor.bloodGroup as BloodGroup] || donor.bloodGroup,
        "Mobile Number": donor.mobileNumber,
        "Email": donor.email || "N/A",
        "Aadhar Number": donor.aadharNumber || "N/A",
        "City": donor.city,
        "State": donor.state || "N/A",
        "Status": donor.status,
        "Registration Date": donor.createdAt.toISOString(),
        "Last Donation": donor.lastDonationDate
          ? donor.lastDonationDate.toISOString()
          : "N/A",
      }));

      // Export using utility
      if (exportFormat === "csv") {
        exportDataToCSV(dataToExport, "donors");
      } else {
        await exportDataToXLS(dataToExport, "donors");
      }
    } catch (error: any) {
      console.error("Export error:", error);
      alert(error.message || "Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Simple CSV export (no external library needed)
  const exportDataToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [headers.join(",")];

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // XLS export using xlsx library
  const exportDataToXLS = async (data: any[], filename: string) => {
    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Donors");
      
      // Set column widths
      const maxWidth = 50;
      const wcols = Object.keys(data[0]).map(() => ({ wch: maxWidth }));
      worksheet["!cols"] = wcols;

      const timestamp = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
    } catch (error) {
      console.error("XLS export error:", error);
      // Fallback to CSV if xlsx is not available
      exportDataToCSV(data, filename);
      alert("XLS export failed. CSV file has been downloaded instead.");
    }
  };

  return (
    <Card>
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Header with Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Donor List</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <FileDown className="h-4 w-4 animate-pulse" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("xls")}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <FileSpreadsheet className="h-4 w-4 animate-pulse" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="hidden sm:inline">Export XLS</span>
                  <span className="sm:hidden">XLS</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, email, or Aadhar..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-9 sm:h-10"
              />
            </div>
            <Select value={bloodGroup} onValueChange={(value) => handleFilter("bloodGroup", value)}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 sm:h-10">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Groups</SelectItem>
                {Object.entries(BLOOD_GROUP_MAP).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => handleFilter("status", value)}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

             {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[200px] justify-start text-left font-normal h-9 sm:h-10",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  className="rounded-md"
                />
              </PopoverContent>
            </Popover>
            {dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDateRange}
                className="h-9 sm:h-10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          </div>
          
         
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Aadhar</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No donors found
                  </TableCell>
                </TableRow>
              ) : (
                donors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell className="font-mono text-sm">{donor.donorId}</TableCell>
                    <TableCell className="font-medium">{donor.fullName}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{BLOOD_GROUP_MAP[donor.bloodGroup]}</Badge>
                    </TableCell>
                    <TableCell>{donor.mobileNumber}</TableCell>
                    <TableCell>{donor.aadharNumber || "N/A"}</TableCell>
                    <TableCell>{donor.city}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          donor.status === "active"
                            ? "default"
                            : donor.status === "inactive"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {donor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(donor.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/blood-panel/${donor.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/blood-panel/${donor.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DonorCertificate donor={donor} organizationName="Blood Donation Camp" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {donors.length} of {total} donors
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  if (bloodGroup !== "all") params.set("bloodGroup", bloodGroup);
                  if (status !== "all") params.set("status", status);
                  if (dateRange?.from) params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
                  if (dateRange?.to) params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
                  params.set("page", String(page - 1));
                  router.push(`/dashboard/blood-panel?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  if (bloodGroup !== "all") params.set("bloodGroup", bloodGroup);
                  if (status !== "all") params.set("status", status);
                  if (dateRange?.from) params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
                  if (dateRange?.to) params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
                  params.set("page", String(page + 1));
                  router.push(`/dashboard/blood-panel?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

