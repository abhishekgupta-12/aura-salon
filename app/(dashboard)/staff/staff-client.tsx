"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, CheckCircle2, XCircle, Users } from "lucide-react";
import { Staff, Service } from "@prisma/client";
import { Modal } from "@/components/shared/modal";
import { useRouter } from "next/navigation";

export function StaffClient({ initialData, services }: { initialData: Staff[], services: Service[] }) {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>(initialData);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Form State
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", specialization: "", image: "", role: "STAFF", 
    serviceIds: [] as string[], workingDays: [] as string[], availableSlots: [] as string[], isActive: true
  });

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.specialization && s.specialization.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenModal = (s?: Staff) => {
    if (s) {
      setSelectedStaff(s);
      setFormData({
        name: s.name, email: s.email || "", phone: s.phone, specialization: s.specialization || "", 
        image: s.image || "", role: s.role, serviceIds: s.serviceIds, workingDays: s.workingDays, 
        availableSlots: s.availableSlots, isActive: s.isActive
      });
    } else {
      setSelectedStaff(null);
      setFormData({ 
        name: "", email: "", phone: "", specialization: "", image: "", role: "STAFF", 
        serviceIds: [], workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], 
        availableSlots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"], 
        isActive: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (s: Staff) => {
    setSelectedStaff(s);
    setIsDeleteModalOpen(true);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day) 
        ? prev.workingDays.filter(d => d !== day) 
        : [...prev.workingDays, day]
    }));
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId) 
        ? prev.serviceIds.filter(id => id !== serviceId) 
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = selectedStaff ? `/api/staff/${selectedStaff.id}` : '/api/staff';
      const method = selectedStaff ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save staff");
      
      const savedStaff = await res.json();
      
      if (selectedStaff) {
        setStaff(staff.map(s => s.id === savedStaff.id ? savedStaff : s));
      } else {
        setStaff([savedStaff, ...staff]);
      }
      
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedStaff) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/staff/${selectedStaff.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      setStaff(staff.filter(s => s.id !== selectedStaff.id));
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete staff");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary-container outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto px-5 py-2.5 bg-primary-container text-on-primary rounded-xl font-medium hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-secondary bg-surface rounded-2xl border border-border-subtle">
            No staff members found.
          </div>
        ) : (
          filteredStaff.map((member) => (
            <div key={member.id} className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden border border-border-subtle">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="h-6 w-6 text-text-secondary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-lg">{member.name}</h3>
                    <p className="text-sm text-text-secondary">{member.specialization || member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(member)} className="p-1.5 text-text-secondary hover:text-primary-container hover:bg-primary-container/10 rounded-lg">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(member)} className="p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4 flex-1">
                <p className="text-sm text-text-primary flex items-center gap-2">
                  <span className="text-text-secondary">Phone:</span> {member.phone}
                </p>
                <p className="text-sm text-text-primary flex items-center gap-2">
                  <span className="text-text-secondary">Days:</span> {member.workingDays.length} days/week
                </p>
                <p className="text-sm text-text-primary flex items-center gap-2">
                  <span className="text-text-secondary">Services:</span> {member.serviceIds.length} assigned
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <div>
                  {member.isActive ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-text-secondary bg-surface-muted px-2 py-1 rounded-lg border border-border-subtle">
                      <XCircle className="h-3.5 w-3.5" /> Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedStaff ? "Edit Staff Member" : "Add Staff Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Full Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Phone *</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Specialization</label>
            <input type="text" placeholder="e.g. Senior Colorist" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${formData.workingDays.includes(day) ? "bg-primary-container text-on-primary border-primary-container" : "bg-surface text-text-secondary border-border-subtle hover:border-primary-container/50"}`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Assigned Services</label>
            <div className="max-h-32 overflow-y-auto border border-border-subtle rounded-xl p-2 bg-surface space-y-1">
              {services.map(service => (
                <label key={service.id} className="flex items-center gap-2 p-1.5 hover:bg-surface-muted rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.serviceIds.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="rounded border-border-subtle text-primary-container focus:ring-primary-container"
                  />
                  <span className="text-sm text-text-primary">{service.name}</span>
                </label>
              ))}
              {services.length === 0 && <p className="text-sm text-text-secondary p-2">No services available.</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 py-2 border-t border-border-subtle mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              <span className="ml-3 text-sm font-medium text-text-primary">Staff member is active</span>
            </label>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-medium text-text-secondary hover:bg-surface-muted">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 rounded-xl font-medium bg-primary-container text-on-primary hover:opacity-90 disabled:opacity-50">
              {isLoading ? "Saving..." : "Save Staff"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Staff Member">
        <div className="space-y-4">
          <p className="text-text-secondary">Are you sure you want to delete <strong>{selectedStaff?.name}</strong>? This action cannot be undone.</p>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 rounded-xl font-medium text-text-secondary hover:bg-surface-muted">Cancel</button>
            <button type="button" onClick={confirmDelete} disabled={isLoading} className="px-5 py-2 rounded-xl font-medium bg-error text-on-error hover:opacity-90 disabled:opacity-50">
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
