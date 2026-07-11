import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from './AdminDashboard';

const API_BASE_URL = 'http://localhost:5005/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/admin/orders`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Could not load orders. Please make sure database services are online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    setError(null);

    try {
      await axios.put(`${API_BASE_URL}/admin/orders/${orderId}/status`, { status: newStatus });
      // Re-fetch orders to refresh the UI state and ensure synchronization
      const response = await axios.get(`${API_BASE_URL}/admin/orders`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Could not update order status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'PLACED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-850 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-800 border-green-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-250';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-stone-900">Manage Orders</h1>
        <p className="text-stone-500 text-sm mt-1">Review customer checkouts, print details, and transition delivery status.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Orders Management Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-150 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Items Details</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Transition Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 text-sm text-stone-600">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-stone-400">
                    No customer orders found in the database.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Order ID & Date */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-stone-950 select-all">
                          {order.id}
                        </span>
                        <span className="text-xs text-stone-400 mt-1">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Customer Details */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-stone-900">
                          {order.user?.name || 'Guest Buyer'}
                        </span>
                        <span className="text-xs text-stone-450 mt-0.5 truncate max-w-[180px]">
                          {order.user?.email || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Items Details */}
                    <td className="px-6 py-4">
                      <div className="space-y-2 max-w-md">
                        {order.orderItems?.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-8 h-10 rounded bg-stone-50 border border-stone-100 overflow-hidden flex-shrink-0">
                              <img
                                src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="truncate text-xs">
                              <p className="font-semibold text-stone-850 truncate max-w-[200px]">{item.product?.name}</p>
                              <p className="text-stone-400 mt-0.5">
                                Qty: {item.quantity} • Price: ${Number(item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-stone-950 text-base">
                        ${Number(order.totalPrice).toFixed(2)}
                      </span>
                    </td>

                    {/* Current Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(order.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {order.status}
                      </span>
                    </td>

                    {/* Transition Dropdown Menu */}
                    <td className="px-6 py-4 text-right">
                      {actionLoadingId === order.id ? (
                        <div className="inline-flex justify-center items-center w-36">
                          <svg className="animate-spin h-5 w-5 text-stone-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="border border-stone-250 bg-stone-50 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 w-36 cursor-pointer"
                        >
                          <option value="PLACED">Placed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
