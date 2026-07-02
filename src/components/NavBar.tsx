"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Moon, Search, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const displayName = session?.user?.name || "User";
  const displayRole = (session?.user as { role?: string })?.role || "guest";
  const avatarLetter = displayName.charAt(0).toUpperCase();

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
          placeholder={displayRole === "candidate" ? "Search jobs..." : "Search candidates, jobs..."}
          className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <button className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-600">
          <Moon size={20} />
        </button>

        <button className="relative p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-600">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Session Profile & Logout */}
        <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {avatarLetter}
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 leading-none">{displayName}</h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block">
                {displayRole}
              </span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition flex items-center justify-center cursor-pointer"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}