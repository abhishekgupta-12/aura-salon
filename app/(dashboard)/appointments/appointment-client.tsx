"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle } from "lucide-react";
import { Appointment, Customer, Staff, Service } from "@prisma/client";
import { Modal } from "@/components/shared/modal";
import { useRouter } from "next/navigation";

type ApptWithRelations = Appointment & { customer: Customer; staff: Staff };

export function AppointmentClient({ 
  initialData, customers, staff, services 
}: { 
  initialData: ApptWithRelations[], customers: Customer[], staff: Staff[], services: Service[] 
}) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<ApptWithRelations[]>(initialData);
  const [searchDate, setSearchDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<ApptWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerId: "", staffId: "", serviceIds: [] as string[], 
    date: "", time: "", duration: 30, notes: "", status: "SCHEDULED"
  });

  const filteredAppts = searchDate 
    ? appointments.filter(a => new Date(a.startTime).toISOString().split('T')[0] === searchDate)
    : appointments;

  const handleOpenModal = (appt?: ApptWithRelations) => {
    if (appt) {
      setSelectedAppt(appt);
      const start = new Date(appt.startTime);
      const end = new Date(appt.endTime);
      const diffMins = Math.round((end.getTime() - start.getTime()) / 60000);
      
      setFormData({
        customerId: appt.customerId, staffId: appt.staffId, serviceIds: appt.serviceIds,
        date: start.toISOString().split('T')[0],
        time: start.toTimeString().substring(0, 5),
        duration: diffMins,
        notes: appt.notes || "", status: appt.status
      });
    } else {
      setSelectedAppt(null);
      setFormData({ 
        customerId: customers[0]?.id || "", staffId: staff[0]?.id || "", serviceIds: [],
        date: new Date().toISOString().split('T')[0], time: "10:00", duration: 30,
        notes: "", status: "SCHEDULED"
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (appt: ApptWithRelations) => {
    setSelectedAppt(appt);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = selectedAppt ? `/api/appointments/${selectedAppt.id}` : '/api/appointments';
      const method = selectedAppt ? 'PUT' : 'POST';
      
      // Calculate start and end times
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60000);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to save appointment");
      }
      
      const savedAppt = await res.json();
      
      if (selectedAppt) {
        setAppointments(appointments.map(a => a.id === savedAppt.id ? savedAppt : a));
      } else {
        setAppointments([...appointments, savedAppt].sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
      }
      
      setIsModalOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedAppt) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppt.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      setAppointments(appointments.filter(a => a.id !== selectedAppt.id));
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => {
      const newServiceIds = prev.serviceIds.includes(serviceId) 
        ? prev.serviceIds.filter(id => id !== serviceId) 
        : [...prev.serviceIds, serviceId];
      
      // Auto-calculate total duration
      let totalDuration = 0;
      newServiceIds.forEach(id => {
        const s = services.find(srv => srv.id === id);
        if (s) totalDuration += s.duration;
      });
      
      return { ...prev, serviceIds: newServiceIds, duration: totalDuration || 30 };
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'CANCELLED': return 'bg-error/10 text-error border-error/20';
      case 'NO_SHOW': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'IN_PROGRESS': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-surface-muted text-text-secondary border-border-subtle';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary-container outline-none transition-all"
          />
          {searchDate && (
            <button onClick={() => setSearchDate("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs hover:underline">
              Clear
            </button>
          )}
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto px-5 py-2.5 bg-primary-container text-on-primary rounded-xl font-medium hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" /> New Booking
        </button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle">
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Time</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Staff</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredAppts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                    No appointments found for this date.
                  </td>
                </tr>
              ) : (
                filteredAppts.map((appt) => {
                  const startTime = new Date(appt.startTime);
                  const endTime = new Date(appt.endTime);
                  return (
                    <tr key={appt.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-primary">
                          {startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {startTime.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-primary flex items-center gap-2">
                          <User className="h-4 w-4 text-text-secondary" /> {appt.customer.name}
                        </div>
                        <div className="text-xs text-text-secondary mt-1 ml-6">{appt.customer.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-surface-elevated text-text-primary text-xs rounded-lg border border-border-subtle font-medium">
                          {appt.staff.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 text-xs rounded-lg border font-bold ${getStatusColor(appt.status)}`}>
                          {appt.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(appt)} className="p-2 text-text-secondary hover:text-primary-container hover:bg-primary-container/10 rounded-lg transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(appt)} className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedAppt ? "Edit Appointment" : "New Booking"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Customer *</label>
            <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container">
              <option value="">Select Customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Staff Member *</label>
            <select required value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container">
              <option value="">Select Staff...</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Services</label>
            <div className="max-h-32 overflow-y-auto border border-border-subtle rounded-xl p-2 bg-surface space-y-1">
              {services.map(service => (
                <label key={service.id} className="flex items-center gap-2 p-1.5 hover:bg-surface-muted rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} className="rounded border-border-subtle text-primary-container focus:ring-primary-container" />
                  <span className="text-sm text-text-primary flex-1">{service.name}</span>
                  <span className="text-xs text-text-secondary">{service.duration}m</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date *</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Time *</label>
              <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Duration (mins) *</label>
              <input required type="number" min="5" step="5" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container">
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container min-h-[60px]" />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-medium text-text-secondary hover:bg-surface-muted">Cancel</button>
            <button type="submit" disabled={isLoading || customers.length === 0 || staff.length === 0} className="px-5 py-2 rounded-xl font-medium bg-primary-container text-on-primary hover:opacity-90 disabled:opacity-50">
              {isLoading ? "Saving..." : "Save Appointment"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Cancel Appointment">
        <div className="space-y-4">
          <p className="text-text-secondary">Are you sure you want to delete this appointment? This action cannot be undone.</p>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 rounded-xl font-medium text-text-secondary hover:bg-surface-muted">Keep</button>
            <button type="button" onClick={confirmDelete} disabled={isLoading} className="px-5 py-2 rounded-xl font-medium bg-error text-on-error hover:opacity-90 disabled:opacity-50">
              {isLoading ? "Deleting..." : "Delete Appointment"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
