/**
 * Dashboard Overview Data Fetching
 * Server-side data fetching for dashboard overview with SSR optimization
 */

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { hasPermission } from "@/lib/auth/permissions";

/**
 * Get dashboard overview statistics
 * Returns comprehensive statistics for dashboard overview cards
 */
export const getDashboardOverviewStats = cache(async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "Unauthorized",
        stats: getEmptyStats(),
      };
    }

    // Get today's date range for daily comparisons
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    // Fetch all data in parallel for optimal performance
    const [
      totalUsers,
      totalRoles,
      todayVisits,
      yesterdayVisits,
    ] = await Promise.all([
      // Total users (check permission)
      (async () => {
        const hasReadAllUsers = await hasPermission(currentUser.userId, "user.read.all");
        if (!hasReadAllUsers) return 0;
        return await prisma.user.count();
      })(),
      
      // Total roles (check permission)
      (async () => {
        const hasReadRoles = await hasPermission(currentUser.userId, "role.read");
        if (!hasReadRoles) return 0;
        return await prisma.role.count();
      })(),
      
      // Today's unique visits
      (async () => {
        const visits = await prisma.visit.findMany({
          where: {
            visitedAt: { gte: today, lt: tomorrow },
          },
          select: { ipAddress: true },
        });
        return new Set(visits.map((v: any) => v.ipAddress)).size;
      })(),
      
      // Yesterday's unique visits (for comparison)
      (async () => {
        const visits = await prisma.visit.findMany({
          where: {
            visitedAt: { gte: yesterday, lt: today },
          },
          select: { ipAddress: true },
        });
        return new Set(visits.map((v: any) => v.ipAddress)).size;
      })(),
    ]);

    // Calculate percentage changes
    const visitChange = yesterdayVisits > 0
      ? ((todayVisits - yesterdayVisits) / yesterdayVisits) * 100
      : todayVisits > 0 ? 100 : 0;

    return {
      success: true,
      stats: {
        totalUsers,
        totalRoles,
        todayUniqueVisits: todayVisits,
        visitChange: parseFloat(visitChange.toFixed(1)),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard overview stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard overview statistics",
      stats: getEmptyStats(),
    };
  }
});

/**
 * Get empty stats for fallback
 */
function getEmptyStats() {
  return {
    totalUsers: 0,
    totalRoles: 0,
    todayUniqueVisits: 0,
    visitChange: 0,
  };
}

