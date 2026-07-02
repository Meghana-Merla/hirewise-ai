"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Upload Resume", icon: Upload, href: "#" },
  { name: "Jobs", icon: BriefcaseBusiness, href: "/jobs" },
  { name: "Candidates", icon: Users, href: "#" },
  { name: "AI Rankings", icon: Trophy, href: "#" },
  { name: "Analytics", icon: BarChart3, href: "#" },
  { name: "Settings", icon: Settings, href: "#" },
];

export default function Sidebar() {
  const pathname = usePathname();

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
          const isActive = pathname === menu.href;

          return (
            <Link
              key={index}
              href={menu.href}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition
              ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <Icon size={20} />
              {menu.name}
            </Link>
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