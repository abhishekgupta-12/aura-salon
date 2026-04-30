import { PageHeader } from "@/components/shared/page-header";
import { ServiceClient } from "./service-client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const session = await auth();
  const salonId = (session?.user as any)?.salonId;

  if (!salonId) {
    redirect("/login");
  }

  const [services, categories] = await Promise.all([
    db.service.findMany({
      where: { salonId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      where: { salonId },
    })
  ]);

  return (
    <>
      <PageHeader title="Service Management" description="Add and manage service categories, pricing, and duration." />
      <ServiceClient initialData={services} categories={categories} />
    </>
  );
}
