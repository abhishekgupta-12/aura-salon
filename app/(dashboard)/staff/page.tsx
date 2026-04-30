import { PageHeader } from "@/components/shared/page-header";
import { StaffClient } from "./staff-client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Staff" };

export default async function StaffPage() {
  const session = await auth();
  const salonId = (session?.user as any)?.salonId;

  if (!salonId) {
    redirect("/login");
  }

  const [staff, services] = await Promise.all([
    db.staff.findMany({
      where: { salonId },
      orderBy: { createdAt: "desc" },
    }),
    db.service.findMany({
      where: { salonId },
    })
  ]);

  return (
    <>
      <PageHeader title="Staff Management" description="Manage your team members, schedules, and services." />
      <StaffClient initialData={staff} services={services} />
    </>
  );
}
