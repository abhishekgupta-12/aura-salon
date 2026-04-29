"use client";

import { Bell, HelpCircle, Search, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface TopBarProps {
  userName?: string;
  userRole?: string;
  userImage?: string;
}

export function TopBar({
  userName = "Salon Owner",
  userRole = "Owner",
  userImage,
}: TopBarProps) {
  const { isCollapsed, setMobileOpen } = useSidebarStore();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 z-40 border-b border-sidebar-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-8 shadow-sm transition-all duration-300",
        isCollapsed ? "left-[72px]" : "left-[260px]",
        "max-md:left-0"
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden p-2 text-text-secondary hover:bg-surface-container-low rounded-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="hidden md:flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-border-subtle w-96 focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
        <Search className="h-4 w-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search clients, staff, or bookings..."
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full text-text-primary placeholder:text-text-secondary"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button className="relative p-2 hover:bg-surface-container-low rounded-full transition-colors text-text-secondary">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>

        <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-text-secondary hidden md:flex">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="h-8 w-px bg-border-subtle mx-1 hidden md:block" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-text-primary">
              {userName}
            </p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">
              {userRole}
            </p>
          </div>
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="w-10 h-10 rounded-full border-2 border-surface shadow-sm group-hover:border-primary-fixed transition-all object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-bold">
              {getInitials(userName)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
