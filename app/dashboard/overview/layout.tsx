import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React from 'react';
import { getDashboardOverviewStats } from '@/lib/actions/dashboard-overview';

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  // Fetch dashboard overview statistics
  const result = await getDashboardOverviewStats();
  const stats = result.stats;

  // Dummy blood-related stats (replace with real data in the future)
  const dummyBloodStats = {
    totalBloodRequests: 128,
    fulfilledRequests: 96,
    upcomingCamps: 4,
    totalDonations: 312
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          {/* Card 1: Today's Unique Visits */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Today's Unique Visits</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {formatNumber(stats.todayUniqueVisits)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {stats.visitChange >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                  {stats.visitChange >= 0 ? '+' : ''}{stats.visitChange.toFixed(1)}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {stats.visitChange >= 0 ? 'Trending up today' : 'Down today'} 
                {stats.visitChange >= 0 ? <IconTrendingUp className='size-4' /> : <IconTrendingDown className='size-4' />}
              </div>
              <div className='text-muted-foreground'>
                Unique visitors today
              </div>
            </CardFooter>
          </Card>

          {/* Card 2: Total Users & Roles */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Users & Roles</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {formatNumber(stats.totalUsers)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  {stats.totalRoles} roles
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Active user accounts <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {stats.totalRoles} role{stats.totalRoles !== 1 ? 's' : ''} configured
              </div>
            </CardFooter>
          </Card>

          {/* Card 3: Total Blood Requests (Dummy) */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Blood Requests</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {formatNumber(dummyBloodStats.totalBloodRequests)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  Dummy data
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Incoming blood requests overview
              </div>
              <div className='text-muted-foreground'>
                Replace with real blood request stats later
              </div>
            </CardFooter>
          </Card>

          {/* Card 4: Upcoming Blood Camps (Dummy) */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Upcoming Blood Camps</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {formatNumber(dummyBloodStats.upcomingCamps)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  Dummy data
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Scheduled blood donation camps
              </div>
              <div className='text-muted-foreground'>
                Hook this up to real camp scheduling data later
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
