import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  // Run all queries in parallel for better performance
  const [
    totalCandidates,
    activeJobs,
    averageScore,
    shortlisted,
    recentUploads,
  ] = await Promise.all([
    prisma.candidate.count(),

    prisma.job.count(),

    prisma.match.aggregate({
      _avg: {
        overallScore: true,
      },
    }),

    prisma.match.count({
      where: {
        recruiterStatus: "SHORTLISTED",
      },
    }),

    prisma.candidate.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    totalCandidates,
    activeJobs,
    averageAIScore: Number(
      (averageScore._avg.overallScore ?? 0).toFixed(1)
    ),
    shortlisted,
    recentUploads,
  };
}