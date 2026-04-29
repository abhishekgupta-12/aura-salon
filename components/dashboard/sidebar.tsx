"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  Users,
  UserCog,
  Package,
  Scissors,
  Megaphone,
  Star,
  BarChart3,
  Settings,
  ChevronLeft,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Staff", href: "/staff", icon: UserCog },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Services", href: "/services", icon: Scissors },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Reviews", href: "/reviews", icon: Star },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle, isMobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar-bg border-r border-sidebar-border z-50 flex flex-col py-6 transition-all duration-300 ease-in-out",
          "shadow-[4px_0_12px_hsla(180,74%,18%,0.03)]",
          isCollapsed ? "w-[72px]" : "w-[260px]",
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn("px-6 mb-10 flex items-center justify-between", isCollapsed && "px-4 justify-center")}>
          <div className={cn(isCollapsed && "hidden")}>
            <h1 className="text-xl font-bold tracking-tight text-primary-container font-[var(--font-heading)]">
              AuraSalon
            </h1>
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Management Suite
            </p>
          </div>
          {isCollapsed && (
            <span className="text-xl font-bold text-primary-container">A</span>
          )}
          <button
            onClick={() => {
              if (isMobileOpen) setMobileOpen(false);
              else toggle();
            }}
            className="hidden md:flex p-1 rounded-md hover:bg-surface-container-low transition-colors text-text-secondary"
          >
            {isMobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 py-3 transition-all duration-200 ease-in-out group",
                  isCollapsed ? "px-4 justify-center" : "px-6",
                  isActive
                    ? "text-primary-container bg-primary-fixed/20 font-semibold border-r-4 border-primary-container"
                    : "text-text-secondary hover:text-primary-container hover:bg-surface-container-low hover:translate-x-1"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive && "text-primary-container"
                  )}
                />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Settings */}
        <div className={cn("px-4 mt-auto", isCollapsed && "px-2")}>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 py-3 rounded-xl transition-all duration-200 text-text-secondary hover:text-primary-container hover:bg-surface-container-low",
              isCollapsed ? "px-2 justify-center" : "px-4",
              pathname === "/settings" && "text-primary-container bg-primary-fixed/20 font-semibold"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
