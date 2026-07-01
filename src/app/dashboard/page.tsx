import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import CandidatePipelineChart from "@/components/charts/CandidatePipelineChart";
import MatchDistributionChart from "@/components/charts/MatchDistributionChart";
import {
  Users,
  BriefcaseBusiness,
  Trophy,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          👋 Welcome back, Recruiter
        </h1>

        <p className="text-slate-500 mt-2">
          AI has analyzed 1248 resumes today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Candidates"
          value="1,248"
          change="+12% this month"
          icon={Users}
          color="bg-blue-600"
        />

        <StatCard
          title="Active Jobs"
          value="18"
          change="+4 new jobs"
          icon={BriefcaseBusiness}
          color="bg-green-600"
        />

        <StatCard
          title="Shortlisted"
          value="342"
          change="+18 today"
          icon={Trophy}
          color="bg-yellow-500"
        />

        <StatCard
          title="Average AI Score"
          value="94.8%"
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