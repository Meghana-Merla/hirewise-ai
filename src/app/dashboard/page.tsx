"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import CandidatePipelineChart from "@/components/charts/CandidatePipelineChart";
import MatchDistributionChart from "@/components/charts/MatchDistributionChart";
import { DashboardStats } from "@/types/dashboard";
import {
  Users,
  BriefcaseBusiness,
  Trophy,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard statistics");
        }
        const data: DashboardStats = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        {/* Heading Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-80 bg-slate-200 rounded-lg mt-3"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-8 w-16 bg-slate-200 rounded"></div>
                  <div className="h-3 w-32 bg-slate-200 rounded"></div>
                </div>
                <div className="h-12 w-12 bg-slate-200 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-2 gap-6 mt-8 animate-pulse">
          <div className="bg-white rounded-2xl shadow-sm p-6 h-80">
            <div className="h-6 w-40 bg-slate-200 rounded mb-4"></div>
            <div className="h-48 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 h-80">
            <div className="h-6 w-40 bg-slate-200 rounded mb-4"></div>
            <div className="h-48 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 shadow-sm max-w-2xl mx-auto mt-8">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Unable to load dashboard data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetch("/api/dashboard/stats")
                    .then((res) => {
                      if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
                      return res.json();
                    })
                    .then((data) => {
                      setStats(data);
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError(err.message || "An unexpected error occurred");
                      setLoading(false);
                    });
                }}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition duration-150 shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          👋 Welcome back, Recruiter
        </h1>

        <p className="text-slate-500 mt-2">
          AI has analyzed {stats?.recentUploads.toLocaleString() ?? 0} resumes in the last 7 days.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Candidates"
          value={stats?.totalCandidates.toLocaleString() ?? "0"}
          change="+12% this month"
          icon={Users}
          color="bg-blue-600"
        />

        <StatCard
          title="Active Jobs"
          value={stats?.activeJobs.toLocaleString() ?? "0"}
          change="+4 new jobs"
          icon={BriefcaseBusiness}
          color="bg-green-600"
        />

        <StatCard
          title="Shortlisted"
          value={stats?.shortlisted.toLocaleString() ?? "0"}
          change="+18 today"
          icon={Trophy}
          color="bg-yellow-500"
        />

        <StatCard
          title="Average AI Score"
          value={stats ? `${stats.averageAIScore}%` : "0%"}
          change="+2.1%"
          icon={TrendingUp}
          color="bg-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 h-80">
          <h2 className="font-semibold text-xl">
            Candidate Pipeline
          </h2>

          <div className="flex items-center justify-center h-full text-gray-400">
            <CandidatePipelineChart />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 h-80">
          <h2 className="font-semibold text-xl">
            AI Match Distribution
          </h2>

          <div className="flex items-center justify-center h-full text-gray-400">
            <MatchDistributionChart />
          </div>
        </div>
      </div>

      {/* Recent Candidates */}
      <div className="bg-white rounded-2xl shadow-sm mt-8 p-6">
        <h2 className="text-2xl font-semibold mb-5">
          Top Ranked Candidates
        </h2>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3">Candidate</th>
              <th>AI Score</th>
              <th>Experience</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b hover:bg-slate-50">
              <td className="py-4">John Doe</td>
              <td>96.2%</td>
              <td>4 Years</td>
              <td>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Excellent
                </span>
              </td>
            </tr>

            <tr className="border-b hover:bg-slate-50">
              <td className="py-4">Alice Smith</td>
              <td>94.8%</td>
              <td>3 Years</td>
              <td>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  Strong
                </span>
              </td>
            </tr>

            <tr className="hover:bg-slate-50">
              <td className="py-4">David Lee</td>
              <td>91.7%</td>
              <td>5 Years</td>
              <td>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Good
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}