"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Droplets, Calendar } from "lucide-react";

interface DonorStats {
  totalDonors: number;
  activeDonors: number;
  newThisWeek: number;
  totalDonations: number;
  bloodGroupStats: Record<string, number>;
  statusStats: Record<string, number>;
}

interface DonorStatsProps {
  stats: DonorStats | null;
  loading?: boolean;
}

function StatsCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-5 w-32" />
    </div>
  );
}

export function DonorStats({ stats, loading = false }: DonorStatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-3 sm:p-4">
            <StatsCardSkeleton />
          </Card>
        ))}
      </div>
    );
  }

  const activePercentage = stats.totalDonors > 0 
    ? Math.round((stats.activeDonors / stats.totalDonors) * 100) 
    : 0;

  const donationPercentage = stats.totalDonors > 0
    ? Math.round((stats.totalDonations / stats.totalDonors) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-blue-700 font-medium">Total Donors</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-900">{stats.totalDonors}</p>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
            <IconTrendingUp className="h-3 w-3 mr-1" />
            +{stats.newThisWeek} this week
          </Badge>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-green-700 font-medium">Active Donors</p>
          <p className="text-xl sm:text-3xl font-bold text-green-900">{stats.activeDonors}</p>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
            {activePercentage}% active
          </Badge>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-purple-700 font-medium">Total Donations</p>
          <p className="text-xl sm:text-3xl font-bold text-purple-900">{stats.totalDonations}</p>
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
            {donationPercentage}% donated
          </Badge>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-orange-700 font-medium">New This Week</p>
          <p className="text-xl sm:text-3xl font-bold text-orange-900">{stats.newThisWeek}</p>
          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
            {stats.newThisWeek > 0 ? (
              <IconTrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <IconTrendingDown className="h-3 w-3 mr-1" />
            )}
            New registrations
          </Badge>
        </div>
      </Card>
    </div>
  );
}

