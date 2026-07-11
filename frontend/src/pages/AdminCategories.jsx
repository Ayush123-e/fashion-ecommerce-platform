import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminDashboard';

const API_BASE_URL = 'http://localhost:5005/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/admin/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Could not load categories. Please verify backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedCategoryId(null);
    setFormData({ name: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setModalMode('edit');
    setSelectedCategoryId(category.id);
    setFormData({ name: category.name });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
    };

    try {
      if (modalMode === 'create') {
        await axios.post(`${API_BASE_URL}/admin/categories`, payload);
      } else {
        await axios.put(`${API_BASE_URL}/admin/categories/${selectedCategoryId}`, payload);
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'An error occurred while saving the category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Products inside must be re-assigned first.`)) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/admin/categories/${id}`);
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.message || 'Could not delete category. Make sure it contains no active products.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <svg className="animate-spin h-8 w-8 text-[#c5a880]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-stone-900">Manage Categories</h1>
          <p className="text-stone-500 text-sm mt-1">Configure and organize product departments and collections.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-stone-950 hover:bg-[#c5a880] hover:text-stone-950 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm max-w-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-150 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 text-sm text-stone-600">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-stone-400">
                    No categories defined. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-400 select-all">
                      {category.id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenEditModal(category)}
                          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all disabled:opacity-55"
                          title="Delete"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-stone-200 text-left">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-150 flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-stone-900">
                {modalMode === 'create' ? 'Create New Category' : 'Edit Category Name'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Category Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g. Footwear, Outerwear"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                    formErrors.name ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : 'border-stone-200 focus:ring-stone-400 bg-stone-50/50'
                  } text-stone-850`}
                />
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-stone-200 text-stone-600 px-5 py-2 rounded-xl font-semibold hover:bg-stone-50 hover:text-stone-900 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-stone-950 hover:bg-[#c5a880] hover:text-stone-950 text-white font-semibold px-5 py-2 rounded-xl transition-all duration-300 disabled:opacity-55 text-sm"
                >
                  {actionLoading ? 'Saving...' : modalMode === 'create' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
