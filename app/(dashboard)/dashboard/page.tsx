import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import {
  IndianRupee,
  CalendarDays,
  UserPlus,
  Ticket,
  Download,
  Plus,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Welcome back. Here's what's happening today."
      >
        <button className="px-4 py-2 bg-surface border border-border-subtle rounded-xl text-sm font-medium text-text-primary hover:bg-surface-container-low transition-colors flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </button>
        <button className="px-5 py-2 bg-primary-container text-on-primary rounded-xl text-sm font-medium hover:opacity-90 shadow-sm transition-all flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Appointment
        </button>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KPICard
          title="Daily Revenue"
          value="₹24,350"
          change="↑ 12.5%"
          changeType="positive"
          icon={IndianRupee}
          iconBg="bg-primary-fixed/30"
          iconColor="text-primary-container"
        >
          {/* Mini sparkline bars */}
          <div className="mt-4 h-12 w-full flex items-end gap-1">
            {[40, 60, 55, 80, 100].map((h, i) => (
              <div
                key={i}
                className={`w-full rounded-sm transition-all ${
                  i === 4
                    ? "bg-primary-container"
                    : "bg-primary-fixed/50"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </KPICard>

        <KPICard
          title="Appointments"
          value="28"
          change="vs 22 avg"
          changeType="neutral"
          icon={CalendarDays}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
        >
          <p className="mt-2 text-xs text-text-secondary flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full" />
            4 upcoming this hour
          </p>
        </KPICard>

        <KPICard
          title="New Clients"
          value="12"
          change="+4 today"
          changeType="positive"
          icon={UserPlus}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
        >
          <div className="mt-4 flex -space-x-2">
            {["bg-primary-fixed", "bg-secondary-container", "bg-tertiary-fixed", "bg-surface-container-high"].map((bg, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full border-2 border-surface ${bg} flex items-center justify-center text-[10px] font-bold text-text-secondary`}
              >
                {i === 3 ? "+9" : ""}
              </div>
            ))}
          </div>
        </KPICard>

        <KPICard
          title="Avg. Ticket"
          value="₹1,850"
          icon={Ticket}
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
        >
          <p className="mt-2 text-xs text-text-secondary">
            <span className="text-success font-semibold">↑ ₹250</span> from
            last week
          </p>
        </KPICard>
      </div>

      {/* Revenue Chart + Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl tonal-shadow border border-border-subtle">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-semibold text-text-primary font-[var(--font-heading)]">
                Revenue Growth
              </h3>
              <p className="text-xs font-medium text-text-secondary">
                Weekly trend analysis
              </p>
            </div>
            <div className="flex bg-surface-container p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-semibold bg-surface rounded-md shadow-sm text-text-primary">
                Daily
              </button>
              <button className="px-3 py-1 text-xs font-semibold text-text-secondary hover:text-primary transition-colors">
                Weekly
              </button>
              <button className="px-3 py-1 text-xs font-semibold text-text-secondary hover:text-primary transition-colors">
                Monthly
              </button>
            </div>
          </div>

          {/* Bar chart visualization */}
          <div className="relative h-[300px] w-full flex items-end justify-between px-2 pt-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-text-secondary pr-4 pointer-events-none">
              <span>₹50k</span>
              <span>₹40k</span>
              <span>₹30k</span>
              <span>₹20k</span>
              <span>₹10k</span>
              <span>0</span>
            </div>
            {/* Grid lines */}
            <div className="absolute inset-0 pl-10 flex flex-col justify-between pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-full border-t ${
                    i === 5 ? "border-border-subtle" : "border-surface-container-low"
                  }`}
                />
              ))}
            </div>
            {/* Bars */}
            <div className="flex-1 ml-10 flex items-end justify-around h-full relative z-10">
              {[
                { day: "MON", h: 45 },
                { day: "TUE", h: 65 },
                { day: "WED", h: 55 },
                { day: "THU", h: 85 },
                { day: "FRI", h: 95, active: true },
                { day: "SAT", h: 70 },
                { day: "SUN", h: 10 },
              ].map((bar) => (
                <div
                  key={bar.day}
                  className="group relative flex flex-col items-center gap-2 w-12"
                >
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      bar.active
                        ? "bg-primary-container"
                        : "bg-primary-container/20 group-hover:bg-primary-container/30"
                    }`}
                    style={{ height: `${bar.h}%` }}
                  />
                  <span
                    className={`text-[10px] font-semibold ${
                      bar.active
                        ? "text-primary-container font-bold"
                        : "text-text-secondary"
                    }`}
                  >
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-surface p-6 rounded-xl tonal-shadow border border-border-subtle flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary font-[var(--font-heading)]">
              Next Bookings
            </h3>
            <a className="text-xs font-semibold text-primary-container hover:underline cursor-pointer">
              View All
            </a>
          </div>

          <div className="space-y-4 flex-1">
            {[
              {
                time: "14:00",
                label: "Now",
                name: "Elena Rodriguez",
                service: "Balayage & Color Melt",
                highlight: true,
              },
              {
                time: "14:45",
                label: "Soon",
                name: "Marcus Thorne",
                service: "Signature Cut & Groom",
              },
              {
                time: "15:30",
                label: "Later",
                name: "Sarah Jenkins",
                service: "Deep Conditioning",
              },
            ].map((appt, i) => (
              <div
                key={i}
                className="p-3 border border-border-subtle rounded-xl hover:bg-surface-muted transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                      appt.highlight
                        ? "bg-primary-fixed/30"
                        : "bg-surface-container-low"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold leading-none uppercase ${
                        appt.highlight
                          ? "text-primary-container"
                          : "text-text-secondary"
                      }`}
                    >
                      {appt.label}
                    </span>
                    <span
                      className={`text-sm font-extrabold ${
                        appt.highlight
                          ? "text-primary-container"
                          : "text-text-primary"
                      }`}
                    >
                      {appt.time}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {appt.name}
                    </p>
                    <p className="text-[11px] text-text-secondary truncate">
                      {appt.service}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-secondary/30 group-hover:text-primary-container transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border-2 border-dashed border-border-subtle rounded-xl text-xs font-semibold text-text-secondary hover:border-primary-fixed hover:text-primary-container transition-all flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Quick Book
          </button>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="mt-4">
        <div className="bg-surface p-6 rounded-xl tonal-shadow border border-border-subtle">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary font-[var(--font-heading)]">
              Campaign Performance
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-container" />
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-surface-dim" />
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  Ended
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Campaign 1 */}
            <div className="bg-surface-muted p-5 rounded-2xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-primary-container uppercase tracking-tighter">
                    WhatsApp Marketing
                  </p>
                  <h4 className="text-sm font-medium text-text-primary">
                    Monsoon Offer 20%
                  </h4>
                </div>
                <div className="p-2 bg-surface rounded-lg shadow-sm">
                  <TrendingUp className="h-4 w-4 text-primary-container" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-text-primary font-[var(--font-heading)]">
                    24.8%
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    Conversion Rate
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-success">
                    +312 users
                  </p>
                  <p className="text-[10px] text-text-secondary">Reach</p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-surface-dim rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-[75%] rounded-full" />
              </div>
            </div>

            {/* Campaign 2 */}
            <div className="bg-surface-muted p-5 rounded-2xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-tighter">
                    Referral Program
                  </p>
                  <h4 className="text-sm font-medium text-text-primary">
                    Share the Glow
                  </h4>
                </div>
                <div className="p-2 bg-surface rounded-lg shadow-sm">
                  <UserPlus className="h-4 w-4 text-primary-container" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-text-primary font-[var(--font-heading)]">
                    12.2%
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    Conversion Rate
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-success">
                    +84 referrals
                  </p>
                  <p className="text-[10px] text-text-secondary">Reach</p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-surface-dim rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-[40%] rounded-full" />
              </div>
            </div>

            {/* Campaign 3 — Featured dark card */}
            <div className="bg-primary-container p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-primary-fixed uppercase tracking-tighter">
                    Instagram Ads
                  </p>
                  <h4 className="text-sm font-medium text-on-primary">
                    Summer Luxe Essentials
                  </h4>
                </div>
                <div className="p-2 bg-on-primary/10 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 text-primary-fixed" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-on-primary font-[var(--font-heading)]">
                    4.5%
                  </p>
                  <p className="text-[10px] text-on-primary/60">
                    Conversion Rate
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-primary-fixed">
                    +2.4k clicks
                  </p>
                  <p className="text-[10px] text-on-primary/60">Reach</p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-on-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary-fixed w-[15%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
