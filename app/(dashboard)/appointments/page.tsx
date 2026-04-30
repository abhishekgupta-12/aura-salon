import { PageHeader } from "@/components/shared/page-header";
import { AppointmentClient } from "./appointment-client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  const session = await auth();
  const salonId = (session?.user as any)?.salonId;

  if (!salonId) {
    redirect("/login");
  }

  const [appointments, customers, staff, services] = await Promise.all([
    db.appointment.findMany({
      where: { salonId },
      include: { customer: true, staff: true },
      orderBy: { startTime: "asc" },
    }),
    db.customer.findMany({ where: { salonId } }),
    db.staff.findMany({ where: { salonId, isActive: true } }),
    db.service.findMany({ where: { salonId, isActive: true } })
  ]);

  return (
    <>
      <PageHeader title="Appointment Calendar" description="Manage bookings, walk-ins, and scheduling." />
      <AppointmentClient 
        initialData={appointments} 
        customers={customers} 
        staff={staff} 
        services={services} 
      />
    </>
  );
}
