import { PageHeader } from "@/components/shared/page-header";
import { CustomerClient } from "./customer-client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const session = await auth();
  const salonId = (session?.user as any)?.salonId;

  if (!salonId) {
    redirect("/login");
  }

  const customers = await db.customer.findMany({
    where: { salonId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Customer Management" description="Review and manage your active clients." />
      <CustomerClient initialData={customers} />
    </>
  );
}
