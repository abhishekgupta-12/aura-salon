"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, DollarSign, Activity } from "lucide-react";
import { Customer } from "@prisma/client";
import { Modal } from "@/components/shared/modal";
import { useRouter } from "next/navigation";

export function CustomerClient({ initialData }: { initialData: Customer[] }) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialData);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", gender: "", birthday: "", notes: ""
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone,
        gender: customer.gender || "",
        birthday: customer.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : "",
        notes: customer.notes || ""
      });
    } else {
      setSelectedCustomer(null);
      setFormData({ name: "", email: "", phone: "", gender: "", birthday: "", notes: "" });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = selectedCustomer ? `/api/customers/${selectedCustomer.id}` : '/api/customers';
      const method = selectedCustomer ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save customer");
      
      const savedCustomer = await res.json();
      
      if (selectedCustomer) {
        setCustomers(customers.map(c => c.id === savedCustomer.id ? savedCustomer : c));
      } else {
        setCustomers([savedCustomer, ...customers]);
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
    if (!selectedCustomer) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete customer");
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
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto px-5 py-2.5 bg-primary-container text-on-primary rounded-xl font-medium hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Customer
        </button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle">
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Name / Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Phone</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Visits</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">Spent</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-text-primary">{customer.name}</p>
                      <p className="text-sm text-text-secondary">{customer.email || "No email"}</p>
                    </td>
                    <td className="px-6 py-4 text-text-primary">{customer.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text-primary">
                        <Activity className="h-4 w-4 text-text-secondary" />
                        {customer.totalVisits}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-text-primary">
                        <DollarSign className="h-4 w-4 text-text-secondary" />
                        {customer.totalSpent.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(customer)}
                          className="p-2 text-text-secondary hover:text-primary-container hover:bg-primary-container/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(customer)}
                          className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedCustomer ? "Edit Customer" : "Add New Customer"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Full Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone Number *</label>
            <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date of Birth</label>
              <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container min-h-[100px]" placeholder="Preferences, allergies, etc." />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-medium text-text-secondary hover:bg-surface-muted">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 rounded-xl font-medium bg-primary-container text-on-primary hover:opacity-90 disabled:opacity-50">
              {isLoading ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.</p>
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
