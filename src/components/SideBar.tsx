"use client";

import {
  LayoutDashboard,
  Upload,
  BriefcaseBusiness,
  Users,
  Trophy,
  BarChart3,
  Settings,
} from "lucide-react";

const menus = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Upload Resume", icon: Upload },
  { name: "Jobs", icon: BriefcaseBusiness },
  { name: "Candidates", icon: Users },
  { name: "AI Rankings", icon: Trophy },
  { name: "Analytics", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="px-8 py-8 border-b border-slate-800">
        <h1 className="text-3xl font-bold">
          HireWise <span className="text-blue-400">AI</span>
        </h1>
      </div>

      <nav className="flex-1 p-5 space-y-2">
        {menus.map((menu, index) => {
          const Icon = menu.icon;

          return (
            <button
              key={index}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition
              ${
                index === 0
                  ? "bg-blue-600"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <Icon size={20} />
              {menu.name}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-5">
        <p className="text-sm text-slate-400">Logged in as</p>
        <h3 className="font-semibold mt-1">Recruiter</h3>
      </div>
    </aside>
  );
}