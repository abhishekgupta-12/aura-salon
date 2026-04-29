import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";

export const metadata = { title: "Appointments" };

export default function AppointmentsPage() {
  return (
    <PageHeader title="Appointment Calendar" description="Manage bookings, walk-ins, and scheduling.">
      <button className="px-5 py-2 bg-primary-container text-on-primary rounded-xl text-sm font-medium hover:opacity-90 shadow-sm transition-all flex items-center gap-2">
        <Plus className="h-4 w-4" /> New Booking
      </button>
    </PageHeader>
  );
}
