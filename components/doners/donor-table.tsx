"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, Download, Eye, Edit, FileText, FileSpreadsheet, FileDown, Calendar, MapPin, Phone, Mail, User, TrendingUp, Users, Activity, Droplets, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import DonorForm from "@/components/doners/donor-form"
import DonorReceipt from "@/components/doners/donor-receipt"
import { listDonorsApi } from "@/apicalls/blood"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from 'next/navigation'

interface Donor {
  id: string
  donorId: string
  ulbId: number
  firstName: string
  lastName: string
  fullName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  bloodGroup: 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG'
  weight: number
  height: number
  mobileNumber: string
  email?: string | null
  permanentAddress?: string | null
  cityStatePin?: string | null
  emergencyContactName?: string | null
  emergencyContactNumber?: string | null
  takingMedication: boolean
  chronicIllness: boolean
  donatedBefore: boolean
  lastDonationDate?: string | null
  surgeryInLast6Months: boolean
  smokeOrAlcohol: boolean
  eligibleForDonation: boolean
  willingToBeRegularDonor: boolean
  notificationPreference: Array<'SMS' | 'EMAIL' | 'PUSH'>
  consentToUseData: boolean
  confirmInformationAccurate: boolean
  status: 'active' | 'inactive' | 'blocked'
  registeredByUserId?: number | null
  createdAt: string
  updatedAt: string
}

interface DonorStats {
  totalDonors: number
  activeDonors: number
  newThisWeek: number
  totalDonations: number
  bloodGroupStats: Record<string, number>
  statusStats: Record<string, number>
}

function DonorTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

function DonorCard({ donor, onEdit, onView, onReceipt, bloodGroupMap, getStatusBadge, getNextEligibleDate, isEligibleForDonation }: any) {
  const nextEligible = getNextEligibleDate(donor.lastDonationDate)
  const isEligible = isEligibleForDonation(donor.lastDonationDate)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{donor.fullName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {donor.mobileNumber}
            </div>
          </div>
        </div>
        <Badge className="bg-red-100 text-red-800 text-xs">{donor.donorId}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="space-y-1">
          <div className="text-gray-500">Blood</div>
          <Badge className="bg-purple-100 text-purple-800 text-xs w-full justify-center">
            {bloodGroupMap[donor.bloodGroup]}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500">Status</div>
          {getStatusBadge(donor.status)}
        </div>
        <div className="space-y-1">
          <div className="text-gray-500">City</div>
          <div className="text-gray-700 font-medium truncate">{donor.cityStatePin?.split(',')[0] || 'N/A'}</div>
        </div>
      </div>

      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Last Donation</span>
          <span className="text-gray-700 font-medium">
            {donor.lastDonationDate ? format(new Date(donor.lastDonationDate), 'dd MMM') : 'Never'}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Next Eligible</span>
          {nextEligible ? (
            <Badge variant={isEligible ? "default" : "outline"} className={`text-xs ${isEligible ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
              {isEligible ? 'Ready' : format(nextEligible, 'dd MMM')}
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Ready</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button size="sm" variant="ghost" onClick={() => onReceipt(donor)} className="flex-1 h-8 text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Receipt
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(donor)} className="flex-1 h-8 text-xs">
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onView(donor)} className="flex-1 h-8 text-xs">
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
      </div>
    </div>
  )
}

function StatsCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-5 w-32" />
    </div>
  )
}

export default function DonorTableEnhanced() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<DonorStats>({
    totalDonors: 0,
    activeDonors: 0,
    newThisWeek: 0,
    totalDonations: 0,
    bloodGroupStats: {},
    statusStats: {}
  })
  const [showFilters, setShowFilters] = useState(false)
  const { selectedUlb } = useAuth()
  const router = useRouter()

  const bloodGroups = [
    { value: "all", label: "All Blood Groups" },
    { value: "A_POS", label: "A+" },
    { value: "A_NEG", label: "A-" },
    { value: "B_POS", label: "B+" },
    { value: "B_NEG", label: "B-" },
    { value: "AB_POS", label: "AB+" },
    { value: "AB_NEG", label: "AB-" },
    { value: "O_POS", label: "O+" },
    { value: "O_NEG", label: "O-" }
  ]

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "blocked", label: "Blocked" }
  ]

  const dateRanges = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7", label: "Last 7 Days" },
    { value: "last30", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" }
  ]

  const bloodGroupMap: { [key: string]: string } = {
    'A_POS': 'A+', 'A_NEG': 'A-', 'B_POS': 'B+', 'B_NEG': 'B-',
    'AB_POS': 'AB+', 'AB_NEG': 'AB-', 'O_POS': 'O+', 'O_NEG': 'O-'
  }

  const getUlbId = (): number => {
    return selectedUlb?.id || 0
  }

  const calculateStats = (donors: Donor[]): DonorStats => {
    const totalDonors = donors.length
    const activeDonors = donors.filter(d => d.status === 'active').length
    const weekAgo = subDays(new Date(), 7)
    const newThisWeek = donors.filter(d => new Date(d.createdAt) >= weekAgo).length

    const bloodGroupStats: Record<string, number> = {}
    const statusStats: Record<string, number> = {}

    donors.forEach(donor => {
      bloodGroupStats[donor.bloodGroup] = (bloodGroupStats[donor.bloodGroup] || 0) + 1
      statusStats[donor.status] = (statusStats[donor.status] || 0) + 1
    })

    return {
      totalDonors,
      activeDonors,
      newThisWeek,
      totalDonations: donors.filter(d => d.donatedBefore).length,
      bloodGroupStats,
      statusStats
    }
  }

  const fetchDonors = async () => {
    setLoading(true)
    try {
      const ulbId = getUlbId()
      if (!ulbId) {
        console.error("No ULB selected")
        setDonors([])
        return
      }

      let dateFilter = {}
      if (dateRange.start && dateRange.end) {
        dateFilter = {
          startDate: startOfDay(new Date(dateRange.start)).toISOString(),
          endDate: endOfDay(new Date(dateRange.end)).toISOString()
        }
      }

      const params = {
        ulbId,
        page: currentPage,
        pageSize: 10,
        ...(searchTerm && { q: searchTerm }),
        ...(bloodGroupFilter && bloodGroupFilter !== 'all' && { bloodGroup: bloodGroupFilter }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...dateFilter
      }

      const result = await listDonorsApi(params)

      if (result && result.items) {
        setDonors(result.items)
        setTotalPages(Math.ceil(result.total / result.pageSize))
        setTotalCount(result.total)
        setStats(calculateStats(result.items))
      } else {
        setDonors([])
        setTotalCount(0)
        setStats(calculateStats([]))
      }
    } catch (error) {
      console.error("Error fetching donors:", error)
      setDonors([])
      setTotalCount(0)
      setStats(calculateStats([]))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedUlb?.id) {
      fetchDonors()
    }
  }, [selectedUlb?.id, currentPage, searchTerm, bloodGroupFilter, statusFilter, dateRange])

  const handleDateRangeChange = (range: string) => {
    const today = new Date()
    switch (range) {
      case "today":
        setDateRange({
          start: format(today, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        })
        break
      case "yesterday":
        const yesterday = subDays(today, 1)
        setDateRange({
          start: format(yesterday, 'yyyy-MM-dd'),
          end: format(yesterday, 'yyyy-MM-dd')
        })
        break
      case "last7":
        setDateRange({
          start: format(subDays(today, 7), 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        })
        break
      case "last30":
        setDateRange({
          start: format(subDays(today, 30), 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        })
        break
      case "custom":
        break
      default:
        setDateRange({ start: "", end: "" })
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const ulbId = getUlbId()
      const response = await fetch('/api/blood/donors/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ulb-id': String(ulbId)
        },
        body: JSON.stringify({
          format,
          filters: {
            search: searchTerm,
            bloodGroup: bloodGroupFilter !== 'all' ? bloodGroupFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            startDate: dateRange.start,
            endDate: dateRange.end,
          }
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `donors-${format}-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
      blocked: "bg-red-100 text-red-800 border-red-200"
    }
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleViewDonor = (donor: Donor) => {
    router.push(`/dashboard/doner-list/${donor.id}`)
  }

  const handleEditDonor = (donor: Donor) => {
    setSelectedDonor(donor)
    setShowEditModal(true)
  }

  const handleViewReceipt = (donor: Donor) => {
    setSelectedDonor(donor)
    setShowReceiptModal(true)
  }

  const getNextEligibleDate = (lastDonationDate: string | null) => {
    if (!lastDonationDate) return null
    const nextDate = new Date(lastDonationDate)
    nextDate.setDate(nextDate.getDate() + 90)
    return nextDate
  }

  const isEligibleForDonation = (lastDonationDate: string | null) => {
    if (!lastDonationDate) return true
    const nextEligible = getNextEligibleDate(lastDonationDate)
    return nextEligible ? new Date() >= nextEligible : true
  }

  return (
    <div className="space-y-4 ">


      {/* Stats Cards - Compact responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-3 sm:p-4">
          <div className="space-y-1">
            {loading ? (
              <StatsCardSkeleton />
            ) : (
              <>
                <p className="text-xs sm:text-sm text-blue-700 font-medium">Total Donors</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-900">{stats.totalDonors}</p>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  <IconTrendingUp className="h-3 w-3 mr-1" />
                  +{stats.newThisWeek}
                </Badge>
              </>
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-3 sm:p-4">
          <div className="space-y-1">
            {loading ? (
              <StatsCardSkeleton />
            ) : (
              <>
                <p className="text-xs sm:text-sm text-green-700 font-medium">Active</p>
                <p className="text-xl sm:text-3xl font-bold text-green-900">{stats.activeDonors}</p>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                  {Math.round((stats.activeDonors / stats.totalDonors) * 100) || 0}%
                </Badge>
              </>
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-3 sm:p-4">
          <div className="space-y-1">
            {loading ? (
              <StatsCardSkeleton />
            ) : (
              <>
                <p className="text-xs sm:text-sm text-purple-700 font-medium">Donations</p>
                <p className="text-xl sm:text-3xl font-bold text-purple-900">{stats.totalDonations}</p>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {Math.round((stats.totalDonations / stats.totalDonors) * 100) || 0}%
                </Badge>
              </>
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 p-3 sm:p-4">
          <div className="space-y-1">
            {loading ? (
              <StatsCardSkeleton />
            ) : (
              <>
                <p className="text-xs sm:text-sm text-orange-700 font-medium">This Week</p>
                <p className="text-xl sm:text-3xl font-bold text-orange-900">{stats.newThisWeek}</p>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                  {stats.newThisWeek > 0 ? <IconTrendingUp className="h-3 w-3 mr-1" /> : <IconTrendingDown className="h-3 w-3 mr-1" />}
                  New
                </Badge>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm rounded-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

          {/* LEFT — Search */}
          <div className="w-full lg:w-1/3 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm rounded-md"
            />
          </div>

          {/* RIGHT — Filters + Export + Refresh */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">

            {/* Date */}
            <Select onValueChange={handleDateRangeChange}>
              <SelectTrigger className="h-9 text-sm w-[120px]">
                <Calendar className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Blood Group */}
            <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
              <SelectTrigger className="h-9 text-sm w-[110px]">
                <Droplets className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Blood" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-sm w-[120px]">
                <Filter className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 text-sm flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="h-4 w-4 mr-2" /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileDown className="h-4 w-4 mr-2" /> PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh */}
            <Button
              variant="outline"
              onClick={fetchDonors}
              disabled={loading}
              className="h-9 text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </Card>


      {/* Table & Cards Section */}
      <div className="hidden md:block">
        <Card className="border-gray-200">
          <ScrollArea className="mt-[-1rem] rounded-t-lg">
            <Table>
              <TableHeader className="bg-red-500/40  px-4 py-1">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm">DONOR ID</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm">NAME</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center text-xs sm:text-sm">BLOOD</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center text-xs sm:text-sm">CITY</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center text-xs sm:text-sm">LAST DONATION</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center text-xs sm:text-sm">NEXT ELIGIBLE</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center text-xs sm:text-sm">STATUS</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center text-xs sm:text-sm">RECEIPT</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center text-xs sm:text-sm">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <DonorTableSkeleton />
                ) : donors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-gray-300" />
                        <span className="text-gray-500">No donors found</span>
                        <Button
                          onClick={() => setShowEditModal(true)}
                          variant="outline"
                          className="mt-2"
                        >
                          Add First Donor
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  donors.map((donor) => {
                    const nextEligible = getNextEligibleDate(donor.lastDonationDate)
                    const isEligible = isEligibleForDonation(donor.lastDonationDate)

                    return (
                      <TableRow key={donor.id} className="hover:bg-gray-50/50 border-b border-gray-100">
                        <TableCell className="font-mono text-xs sm:text-sm font-semibold text-gray-900">
                          {donor.donorId}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate text-xs sm:text-sm">{donor.fullName}</div>
                              <div className="text-xs text-gray-500">{donor.mobileNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm">
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {bloodGroupMap[donor.bloodGroup]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm text-gray-600">
                          {donor.cityStatePin?.split(',')[0] || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm text-gray-600">
                          {donor.lastDonationDate ? format(new Date(donor.lastDonationDate), 'dd MMM') : 'Never'}
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm">
                          {nextEligible ? (
                            <Badge variant={isEligible ? "default" : "outline"} className={`text-xs ${isEligible ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                              {isEligible ? 'Ready' : format(nextEligible, 'dd MMM')}
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                              Ready
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm">
                          {getStatusBadge(donor.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReceipt(donor)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDonor(donor)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDonor(donor)}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 p-3 sm:p-4 border-t border-gray-200 text-sm">
              <div className="text-xs sm:text-sm text-gray-600">
                Showing {donors.length} of {totalCount}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs"
                >
                  Prev
                </Button>
                <span className="text-xs text-gray-600 min-w-[60px] text-center">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : donors.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No donors found</p>
            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              className="w-full"
            >
              Add First Donor
            </Button>
          </Card>
        ) : (
          <div>
            {donors.map((donor) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                onEdit={handleEditDonor}
                onView={handleViewDonor}
                onReceipt={handleViewReceipt}
                bloodGroupMap={bloodGroupMap}
                getStatusBadge={getStatusBadge}
                getNextEligibleDate={getNextEligibleDate}
                isEligibleForDonation={isEligibleForDonation}
              />
            ))}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center gap-2 p-3 bg-white rounded-lg border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex-1 h-8 text-xs"
                >
                  Prev
                </Button>
                <span className="text-xs text-gray-600">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex-1 h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Donor Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDonor ? 'Edit Donor' : 'Add New Donor'}</DialogTitle>
          </DialogHeader>
          <DonorForm
            initialData={selectedDonor}
            pageTitle={selectedDonor ? "Edit Donor" : "Register New Donor"}
            onSuccess={() => {
              setShowEditModal(false)
              setSelectedDonor(null)
              fetchDonors()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Donor Receipt Modal */}
      {selectedDonor && (
        <DonorReceipt
          donor={selectedDonor}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  )
}
