"use client"

import { useState, useEffect } from "react"
import { getDonorApi, Donor } from "@/apicalls/blood"
import { authStorage } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconHome, IconBuilding, IconUser, IconFileText, IconRuler, IconImageInPicture, IconDownload } from "@tabler/icons-react"
import { BloodHeader } from "./blood-header"
import { StatsGrid } from "./stats-grid"
import { OverviewTab } from "./tabs/overview-tab"
import { ReportsTab } from "./tabs/reports-tab"
import { LogsTab } from "./tabs/log-tab"

const buildMediaUrl = (path?: string | null) => {
  if (!path) return undefined
  const normalized = path.replace(/\\/g, "/")
  if (/^https?:\/\//i.test(normalized)) return normalized
  return `${process.env.NEXT_PUBLIC_API_URL}/${normalized}`
}

export default function DonorDetails({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [donor, setDonor] = useState<Donor | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const user = authStorage.getUser()

  useEffect(() => {
    const user: any = authStorage.getUser()

    if (!user) {
      setError("User not found")
      return
    }

    // Collect all ULB IDs the user has access to
    const ulbList = user?.ulb || []
    if (ulbList.length === 0) {
      setError("No ULBs assigned to this user")
      return
    }

    // Function to try fetching donor details from all allowed ULBs
    const fetchDonor = async () => {
      setLoading(true)
      setError(null)

      for (const ulb of ulbList) {
        try {
          const donorData = await getDonorApi(ulb.id, id)
          if (donorData) {
            setDonor(donorData)
            setLoading(false)
            return
          }
        } catch (err: any) {
          console.warn(`Failed for ULB ${ulb.name}:`, err.message)
          // Continue trying next ULB
        }
      }

      setLoading(false)
      setError("Donor not found in any accessible ULBs")
    }

    fetchDonor()
  }, [id])

  console.log("Donor details:", donor)
  console.log("Donor ID param:", id)
  console.log("User data:", user)

  if (error)
    return <div className="text-sm text-red-600">{error}</div>

  if (loading || !donor)
    return <div className="text-sm text-muted-foreground">Loading donor details...</div>


  return (
    <div className="min-h-screen">
      <div className="w-full max-w-none mx-auto   py-6 lg:py-4 space-y-4">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
        <BloodHeader donor={donor} buildMediaUrl={buildMediaUrl} />
        </div>

        {/* Stats Grid */}
        <StatsGrid donor={donor} />

        {/* Tabs Section */}
        <Card className="border shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab List - Scrollable on mobile */}
            <div className="border-b overflow-x-auto">
              <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-0 rounded-none">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
                >
                  <IconHome className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
              
                <TabsTrigger
                  value="reports"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
                >
                  <IconRuler className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
            
                <TabsTrigger
                  value="logs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
                >
                  <IconFileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logs</span>
                </TabsTrigger>
               
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab donor={donor} buildMediaUrl={buildMediaUrl} />
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <ReportsTab donor={donor} buildMediaUrl={buildMediaUrl} />
              </TabsContent>

            

              <TabsContent value="logs" className="mt-0">
                <LogsTab donor={donor} buildMediaUrl={buildMediaUrl} />
              </TabsContent>


            

            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}