import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconTrendingUp, IconRuler, IconFileText, IconLayoutList } from "@tabler/icons-react"

export function StatsGrid({ donor }: any) {
  const stats = [
    {
      label: "Total Donations",
      value: `${donor.totalDonations || 0}`,
      unit: "units",
      icon: IconRuler,
      color: "text-green-600",
    },
    {
      label: "Last Donation",
      value: `${donor.lastDonationDate || 0}`,
      unit: "sq ft",
      icon: IconRuler,
      color: "text-blue-600",
    },
    
    {
      label: "Reports Uploaded",
      value: `${donor.reportsUploaded || 0}`,
      unit: "",
      icon: IconLayoutList,
      color: "text-purple-600",
    },
    {
      label: "Messages Sent",
      value: `${donor.messagesSent || 0}`,
      unit: "",
      icon: IconFileText,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardDescription className="text-xs font-medium">{stat.label}</CardDescription>
                  <div className="mt-2 flex items-center">
                    <CardTitle className="text-2xl sm:text-3xl font-bold">{stat.value}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 ml-2">{stat.unit}</p>
                  </div>
                </div>
                <Icon className={`h-8 w-8 ${stat.color} opacity-20`} />
              </div>
           
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}