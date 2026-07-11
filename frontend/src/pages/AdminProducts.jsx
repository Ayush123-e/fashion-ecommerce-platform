import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminDashboard';

const API_BASE_URL = 'http://localhost:5005/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imagesString: '', // comma-separated URLs
    sizesString: '',  // comma-separated sizes
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/admin/categories`),
      ]);
      
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching admin products data:', err);
      setError('Could not load products catalog or categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedProductId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '0',
      categoryId: categories[0]?.id || '',
      imagesString: '',
      sizesString: 'S, M, L, XL',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setSelectedProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId,
      imagesString: product.images ? product.images.join(', ') : '',
      sizesString: product.sizes ? product.sizes.join(', ') : '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    const priceNum = Number(formData.price);
    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price must be a valid number greater than 0';
    }

    const stockNum = Number(formData.stock);
    if (formData.stock === '') {
      errors.stock = 'Stock is required';
    } else if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      errors.stock = 'Stock must be a non-negative integer';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Category selection is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setError(null);

    // Clean image URLs array
    const images = formData.imagesString
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    // Clean sizes array
    const sizes = formData.sizesString
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: parseInt(formData.stock, 10),
      categoryId: formData.categoryId,
      images,
      sizes,
    };

    try {
      if (modalMode === 'create') {
        await axios.post(`${API_BASE_URL}/admin/products`, payload);
      } else {
        await axios.put(`${API_BASE_URL}/admin/products/${selectedProductId}`, payload);
      }
      setIsModalOpen(false);
      // Re-fetch database state to update the list
      await fetchInitialData();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'An error occurred while saving the product listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the product listing "${name}"?`)) {
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/admin/products/${id}`);
      await fetchInitialData();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Could not delete product listing.');
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
          <h1 className="text-3xl font-bold font-serif text-stone-900">Manage Products</h1>
          <p className="text-stone-500 text-sm mt-1">Create, update, and remove listings from the active catalog.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-stone-950 hover:bg-[#c5a880] hover:text-stone-950 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-150 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <th className="px-6 py-4 w-20">Image</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 text-sm text-stone-600">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-stone-400">
                    No products cataloged in this system yet. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-14 rounded bg-stone-100 border border-stone-150 overflow-hidden">
                        <img 
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      <div>
                        <p>{product.name}</p>
                        <p className="font-mono text-[10px] text-stone-400 mt-0.5 select-all">{product.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-950">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.stock === 0 ? 'text-red-650' : 'text-stone-700'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-stone-200 text-left">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-150 flex items-center justify-between">
              <h3 className="text-xl font-bold font-serif text-stone-900">
                {modalMode === 'create' ? 'Create New Product' : 'Edit Product Listing'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                      formErrors.name ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : 'border-stone-200 focus:ring-stone-400 bg-stone-50/50'
                    } text-stone-850`}
                  />
                  {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label htmlFor="categoryId" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                      formErrors.categoryId ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : 'border-stone-200 focus:ring-stone-400 bg-stone-50/50'
                    } text-stone-850`}
                  >
                    {categories.length === 0 ? (
                      <option value="">No Categories Available</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
                  </select>
                  {formErrors.categoryId && <p className="text-xs text-red-600 mt-1">{formErrors.categoryId}</p>}
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Price ($)</label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    placeholder="e.g. 59.99"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                      formErrors.price ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : 'border-stone-200 focus:ring-stone-400 bg-stone-50/50'
                    } text-stone-850`}
                  />
                  {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
                </div>

                {/* Stock Limit */}
                <div>
                  <label htmlFor="stock" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Inventory Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                      formErrors.stock ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : 'border-stone-200 focus:ring-stone-400 bg-stone-50/50'
                    } text-stone-850`}
                  />
                  {formErrors.stock && <p className="text-xs text-red-600 mt-1">{formErrors.stock}</p>}
                </div>

                {/* Image URLs */}
                <div>
                  <label htmlFor="imagesString" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Image URLs (comma separated)</label>
                  <input
                    type="text"
                    id="imagesString"
                    name="imagesString"
                    placeholder="url1, url2, url3"
                    value={formData.imagesString}
                    onChange={handleInputChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50/50 text-stone-850"
                  />
                  <p className="text-[10px] text-stone-450 mt-1">Provide one or more image URLs, separated by commas.</p>
                </div>

                {/* Sizes Option */}
                <div>
                  <label htmlFor="sizesString" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Sizes (comma separated)</label>
                  <input
                    type="text"
                    id="sizesString"
                    name="sizesString"
                    placeholder="e.g. S, M, L, XL"
                    value={formData.sizesString}
                    onChange={handleInputChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50/50 text-stone-850"
                  />
                  <p className="text-[10px] text-stone-450 mt-1">Provide size options separated by commas (e.g. S, M, L or One Size).</p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                      formErrors.description ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : 'border-stone-200 focus:ring-stone-400 bg-stone-50/50'
                    } text-stone-850`}
                  ></textarea>
                  {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-stone-200 text-stone-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-stone-50 hover:text-stone-900 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-stone-950 hover:bg-[#c5a880] hover:text-stone-950 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-55 text-sm"
                >
                  {actionLoading ? 'Saving...' : modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
