"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Calendar, TrendingUp, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar as CalendarComponent } from '../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { format } from 'date-fns';

// interface SearchReportsProps {
//   navigateTo: (page: string, donorId?: string) => void;
// }

export default function SearchReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const reports = [
    { id: 1, donorId: '1', donorName: 'Rajesh Kumar', mobile: '+91 98765 43210', aadhaar: '1234 5678 9012', hospital: 'City Hospital', uploadDate: '2024-10-15', status: 'delivered', filename: 'report_oct2024.pdf' },
    { id: 2, donorId: '2', donorName: 'Priya Sharma', mobile: '+91 98765 43211', aadhaar: '2345 6789 0123', hospital: 'Blood Bank Koramangala', uploadDate: '2024-10-14', status: 'delivered', filename: 'report_oct2024_2.pdf' },
    { id: 3, donorId: '3', donorName: 'Amit Patel', mobile: '+91 98765 43212', aadhaar: '3456 7890 1234', hospital: 'City Hospital', uploadDate: '2024-10-13', status: 'pending', filename: 'report_oct2024_3.pdf' },
    { id: 4, donorId: '4', donorName: 'Sneha Reddy', mobile: '+91 98765 43213', aadhaar: '4567 8901 2345', hospital: 'Metro Hospital', uploadDate: '2024-10-12', status: 'delivered', filename: 'report_oct2024_4.pdf' },
    { id: 5, donorId: '5', donorName: 'Vikram Singh', mobile: '+91 98765 43214', aadhaar: '5678 9012 3456', hospital: 'Blood Bank Koramangala', uploadDate: '2024-10-11', status: 'delivered', filename: 'report_oct2024_5.pdf' },
    { id: 6, donorId: '6', donorName: 'Anita Desai', mobile: '+91 98765 43215', aadhaar: '6789 0123 4567', hospital: 'City Hospital', uploadDate: '2024-10-10', status: 'delivered', filename: 'report_oct2024_6.pdf' },
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.mobile.includes(searchQuery) ||
      report.aadhaar.includes(searchQuery);
    
    const matchesHospital = hospitalFilter === 'all' || report.hospital === hospitalFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesHospital && matchesStatus;
  });

  const stats = {
    totalReports: reports.length,
    delivered: reports.filter(r => r.status === 'delivered').length,
    pending: reports.filter(r => r.status === 'pending').length,
    thisMonth: reports.filter(r => new Date(r.uploadDate).getMonth() === new Date().getMonth()).length,
  };

  return (
    <div className="space-y-6">
    
    

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Reports</CardTitle>
          <CardDescription>Filter reports by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Name, mobile, or Aadhaar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hospital</Label>
              <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hospitals</SelectItem>
                  <SelectItem value="City Hospital">City Hospital</SelectItem>
                  <SelectItem value="Blood Bank Koramangala">Blood Bank Koramangala</SelectItem>
                  <SelectItem value="Metro Hospital">Metro Hospital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {dateFrom && dateTo ? (
                      <>
                        {format(dateFrom, "MMM d")} - {format(dateTo, "MMM d")}
                      </>
                    ) : (
                      'Select dates'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery('');
              setHospitalFilter('all');
              setStatusFilter('all');
              setDateFrom(undefined);
              setDateTo(undefined);
            }}>
              Clear Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Report Records</CardTitle>
              <CardDescription>
                Showing {filteredReports.length} of {reports.length} reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Aadhaar</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <button
                      // onClick={() => navigateTo('donor-profile', report.donorId)}
                      className="text-red-600 hover:underline"
                    >
                      {report.donorName}
                    </button>
                  </TableCell>
                  <TableCell>{report.mobile}</TableCell>
                  <TableCell>{report.aadhaar}</TableCell>
                  <TableCell>{report.hospital}</TableCell>
                  <TableCell>{report.uploadDate}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'delivered' ? 'default' : 'secondary'}
                      className={report.status === 'delivered' ? 'bg-green-500' : ''}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

     
    </div>
  );
}
