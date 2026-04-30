import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Users,
  Briefcase,
  Scissors,
  CalendarDays,
  Plus,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const salonId = (session?.user as any)?.salonId;

  if (!salonId) {
    redirect("/login");
  }

  // Fetch real metrics
  const totalCustomers = await db.customer.count({ where: { salonId } });
  const totalStaff = await db.staff.count({ where: { salonId } });
  const totalServices = await db.service.count({ where: { salonId } });
  const totalAppointments = await db.appointment.count({ where: { salonId } });
  
  const upcomingAppointments = await db.appointment.findMany({
    where: { 
      salonId,
      startTime: { gte: new Date() },
      status: { notIn: ["CANCELLED", "COMPLETED"] }
    },
    include: { customer: true },
    orderBy: { startTime: 'asc' },
    take: 5
  });

  const recentCustomers = await db.customer.findMany({
    where: { salonId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return (
    <>
      <PageHeader
        title="Overview"
        description="Welcome back. Here's what's happening today."
      >
        <Link href="/appointments" className="px-5 py-2 bg-primary-container text-on-primary rounded-xl text-sm font-medium hover:opacity-90 shadow-sm transition-all flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Appointment
        </Link>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KPICard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={Users}
          iconBg="bg-primary-fixed/30"
          iconColor="text-primary-container"
        />

        <KPICard
          title="Total Staff"
          value={totalStaff.toString()}
          icon={Briefcase}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
        />

        <KPICard
          title="Total Services"
          value={totalServices.toString()}
          icon={Scissors}
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        
        <KPICard
          title="Total Appointments"
          value={totalAppointments.toString()}
          icon={CalendarDays}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Customers */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl tonal-shadow border border-border-subtle flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary font-[var(--font-heading)]">
              Recently Added Customers
            </h3>
            <Link href="/customers" className="text-xs font-semibold text-primary-container hover:underline cursor-pointer">
              View All
            </Link>
          </div>
          
          {recentCustomers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
              No customers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-xs text-text-secondary">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium text-right">Added On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id} className="text-sm">
                      <td className="py-3 font-medium text-text-primary">{customer.name}</td>
                      <td className="py-3 text-text-secondary">{customer.phone}</td>
                      <td className="py-3 text-right text-text-secondary">
                        {customer.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-surface p-6 rounded-xl tonal-shadow border border-border-subtle flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary font-[var(--font-heading)]">
              Upcoming Bookings
            </h3>
            <Link href="/appointments" className="text-xs font-semibold text-primary-container hover:underline cursor-pointer">
              Calendar
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {upcomingAppointments.length === 0 ? (
              <div className="flex h-full items-center justify-center text-text-secondary text-sm">
                No upcoming bookings.
              </div>
            ) : (
              upcomingAppointments.map((appt) => {
                const startTime = new Date(appt.startTime);
                return (
                  <div
                    key={appt.id}
                    className="p-3 border border-border-subtle rounded-xl hover:bg-surface-muted transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center bg-primary-fixed/30 text-primary-container">
                        <span className="text-[10px] font-bold leading-none uppercase">
                          {startTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-sm font-extrabold mt-1">
                          {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-text-primary truncate">
                          {appt.customer.name}
                        </p>
                        <p className="text-xs font-medium text-text-secondary truncate mt-0.5">
                          {appt.status}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-text-secondary/30 group-hover:text-primary-container transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
