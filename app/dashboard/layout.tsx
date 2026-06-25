import { LayoutDashboard, LogOut, Settings, Car, Bot, Users, Activity, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import { FilterProvider } from "@/app/components/FilterContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterProvider>
      <div className="flex h-screen bg-[#09090b] text-zinc-50 overflow-hidden font-sans">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-[#09090b] flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#EB0A1E] rounded flex items-center justify-center">
                <Car className="text-white w-5 h-5" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Trust Toyota</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-zinc-500 mb-4 px-2 uppercase tracking-wider">
              Menu
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">Platform</span>
            </Link>
            <Link
              href="/dashboard/team"
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Team Performance</span>
            </Link>
            <Link
              href="/dashboard/showrooms"
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Showrooms</span>
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Executive Reports</span>
            </Link>
            <Link
              href="/dashboard/simulator"
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Impact Simulator</span>
            </Link>
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Copilot</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors mt-1">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#09090b]">
          {children}
        </main>
      </div>
    </FilterProvider>
  );
}
