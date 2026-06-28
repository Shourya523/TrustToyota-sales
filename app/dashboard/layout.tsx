"use client";

import { LayoutDashboard, LogOut, Settings, Car, Bot, Users, Activity, MapPin, FileText, Menu, X, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FilterProvider } from "@/app/components/FilterContext";
import { FabASKai } from "@/app/components/fabASKai";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <FilterProvider>
      <div className="flex h-screen bg-[#09090b] text-zinc-50 overflow-hidden font-sans">
        
        {/* Mobile Header & Toggle FAB */}
        <div className="md:hidden absolute top-4 left-4 z-50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-300 shadow-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside 
          className={`
            fixed md:relative z-40 
            w-64 h-full border-r border-zinc-800 bg-[#09090b] flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          <div className="h-16 flex items-center px-6 border-b border-zinc-800 pt-4 md:pt-0 pl-16 md:pl-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#EB0A1E] rounded flex items-center justify-center">
                <Car className="text-white w-5 h-5" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Trust Toyota</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4 md:mt-0">
            <div className="text-xs font-semibold text-zinc-500 mb-4 px-2 uppercase tracking-wider">
              Menu
            </div>
            <Link
              href="/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">Platform</span>
            </Link>
            <Link
              href="/dashboard/team"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Team Performance</span>
            </Link>
            <Link
              href="/dashboard/showrooms"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Showrooms</span>
            </Link>
            <Link
              href="/dashboard/chat"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Copilot</span>
            </Link>
            <Link
              href="/dashboard/widgets"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-[#EB0A1E]" />
              <span className="text-sm font-medium">My Widgets</span>
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

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#09090b] pt-16 md:pt-0">
          {children}
        </main>
        
        {pathname !== "/dashboard/chat" && <FabASKai />}
      </div>
    </FilterProvider>
  );
}
