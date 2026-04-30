"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Clock, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import { Service, Category } from "@prisma/client";
import { Modal } from "@/components/shared/modal";
import { useRouter } from "next/navigation";

type ServiceWithCategory = Service & { category: Category };

export function ServiceClient({ initialData, categories }: { initialData: ServiceWithCategory[], categories: Category[] }) {
  const router = useRouter();
  const [services, setServices] = useState<ServiceWithCategory[]>(initialData);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, duration: 30, image: "", categoryId: "", isActive: true
  });
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategoryLoading, setIsAddingCategoryLoading] = useState(false);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (service?: ServiceWithCategory) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        price: service.price,
        duration: service.duration,
        image: service.image || "",
        categoryId: service.categoryId,
        isActive: service.isActive
      });
    } else {
      setSelectedService(null);
      setFormData({ name: "", description: "", price: 0, duration: 30, image: "", categoryId: localCategories[0]?.id || "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsAddingCategoryLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create category");
      const newCategory = await res.json();
      setLocalCategories([...localCategories, newCategory]);
      setFormData({ ...formData, categoryId: newCategory.id });
      setNewCategoryName("");
      setIsAddingCategory(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create category");
    } finally {
      setIsAddingCategoryLoading(false);
    }
  };

  const handleDeleteClick = (service: ServiceWithCategory) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = selectedService ? `/api/services/${selectedService.id}` : '/api/services';
      const method = selectedService ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          duration: Number(formData.duration)
        }),
      });

      if (!res.ok) throw new Error("Failed to save service");
      
      const savedService = await res.json();
      
      if (selectedService) {
        setServices(services.map(s => s.id === savedService.id ? savedService : s));
      } else {
        setServices([savedService, ...services]);
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
    if (!selectedService) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/services/${selectedService.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      setServices(services.filter(s => s.id !== selectedService.id));
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete service");
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
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary-container outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto px-5 py-2.5 bg-primary-container text-on-primary rounded-xl font-medium hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-secondary bg-surface rounded-2xl border border-border-subtle">
            No services found.
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-text-primary text-lg">{service.name}</h3>
                  <span className="inline-block px-2.5 py-1 bg-surface-muted text-text-secondary text-xs rounded-lg mt-1 font-medium border border-border-subtle">
                    {service.category.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(service)} className="p-1.5 text-text-secondary hover:text-primary-container hover:bg-primary-container/10 rounded-lg">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(service)} className="p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">{service.description || "No description provided."}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                    <Clock className="h-4 w-4 text-text-secondary" /> {service.duration} min
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                    <DollarSign className="h-4 w-4 text-text-secondary" /> {service.price}
                  </div>
                </div>
                <div>
                  {service.isActive ? (
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
        title={selectedService ? "Edit Service" : "Add New Service"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Service Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-text-primary">Category *</label>
              {!isAddingCategory && (
                <button type="button" onClick={() => setIsAddingCategory(true)} className="text-xs text-primary-container font-medium hover:underline">
                  + New Category
                </button>
              )}
            </div>
            
            {isAddingCategory ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Category Name" 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)} 
                  className="flex-1 px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container"
                />
                <button 
                  type="button" 
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || isAddingCategoryLoading}
                  className="px-4 py-2 bg-primary-container text-on-primary rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isAddingCategoryLoading ? "..." : "Save"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsAddingCategory(false); setNewCategoryName(""); }}
                  className="px-4 py-2 bg-surface-muted text-text-secondary rounded-xl text-sm font-medium hover:bg-surface-elevated"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container">
                  <option value="">Select Category...</option>
                  {localCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {localCategories.length === 0 && <p className="text-xs text-error mt-1">Please create a category first.</p>}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Price *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full pl-9 pr-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Duration (min) *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input required type="number" min="1" step="5" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="w-full pl-9 pr-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Image URL</label>
            <input type="url" placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-border-subtle rounded-xl bg-surface focus:ring-2 focus:ring-primary-container min-h-[80px]" />
          </div>
          <div className="flex items-center gap-3 py-2 border-t border-border-subtle mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              <span className="ml-3 text-sm font-medium text-text-primary">Service is active</span>
            </label>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-medium text-text-secondary hover:bg-surface-muted">Cancel</button>
            <button type="submit" disabled={isLoading || localCategories.length === 0} className="px-5 py-2 rounded-xl font-medium bg-primary-container text-on-primary hover:opacity-90 disabled:opacity-50">
              {isLoading ? "Saving..." : "Save Service"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Service">
        <div className="space-y-4">
          <p className="text-text-secondary">Are you sure you want to delete <strong>{selectedService?.name}</strong>? This action cannot be undone.</p>
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
