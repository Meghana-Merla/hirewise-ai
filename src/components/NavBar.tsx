"use client";

import { Bell, Moon, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-white rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-[420px]">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search candidates, jobs..."
          className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <button className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition">
          <Moon size={20} />
        </button>

        <button className="relative p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition">
          <Bell size={20} />

          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            M
          </div>

          <div>
            <h4 className="font-semibold text-slate-800">Meghana</h4>
            <p className="text-sm text-gray-500">Recruiter</p>
          </div>
        </div>
      </div>
    </header>
  );
}