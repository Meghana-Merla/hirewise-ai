import { ReactNode } from "react";
import Sidebar from "./SideBar";
import Navbar from "./NavBar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <Navbar />

        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}