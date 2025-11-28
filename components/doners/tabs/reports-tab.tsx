"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IconCalendar } from "@tabler/icons-react"
import { useMemo } from "react"

export function ReportsTab({ donor }: any) {
  const stats = useMemo(() => {
    const demands = donor.propertyDemand || []
    return {
      total: demands.length,
      totalTax: demands.reduce((sum: number, d: any) => sum + (d.total_tax || 0), 0),
      avgTax:
        demands.length > 0
          ? Math.round(demands.reduce((sum: number, d: any) => sum + (d.total_tax || 0), 0) / demands.length)
          : 0,
    }
  }, [donor.propertyDemand])

  if (!stats.total) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No Reports available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/50 border border-muted">
          <p className="text-xs text-muted-foreground font-medium">Total Records</p>
          <p className="text-xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-muted">
          <p className="text-xs text-muted-foreground font-medium">Total Tax</p>
          <p className="text-lg font-bold text-primary">₹{stats.totalTax.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-muted">
          <p className="text-xs text-muted-foreground font-medium">Avg Tax</p>
          <p className="text-lg font-bold text-foreground">₹{stats.avgTax.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        {donor.propertyDemand.map((demand: any, idx: number) => (
          <Card
            key={idx}
            className="border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 overflow-hidden"
          >
            <CardContent className="p-4">
            


              {/* Tax Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1 text-xs">

               <div className="space-y-1">
                   <h3 className="font-semibold text-foreground text-sm">FY {demand.saf_fy_year || "N/A"}</h3>
                    <p className="text-xs text-muted-foreground">{demand.const_age || 0} years old</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Ward Rate</p>
                  <p className="font-semibold text-foreground">₹{demand.ward_rate || "0"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">ARV Rate</p>
                  <p className="font-semibold text-foreground">₹{demand.arv_rate || "0"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Carpet ARV</p>
                  <p className="font-semibold text-foreground">₹{demand.carpetArv_rate || "0"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">House Tax</p>
                  <p className="font-semibold text-foreground">₹{demand.house_tax || "0"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Water Tax</p>
                  <p className="font-semibold text-foreground">₹{demand.water_tax || "0"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Waste Tax</p>
                  <p className="font-semibold text-foreground">₹{demand.waste_tax || "0"}</p>
                </div>
               <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Total</p>
                  <p className="font-semibold text-foreground">₹{demand.total_tax?.toLocaleString() || "0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}