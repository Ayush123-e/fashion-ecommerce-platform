import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api';

// Admin Layout wrapper providing sidebar navigation and header details
export const AdminLayout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Categories', href: '/admin/categories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-stone-50 text-left">
      {/* Mobile Sub-Navbar navigation (visible on small viewports) */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex flex-wrap gap-2 justify-center">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex-shrink-0 hidden md:block">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Admin Control</h2>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <svg className="w-5 h-5 animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch products, orders and categories concurrently to aggregate statistics
        const [prodRes, orderRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/admin/orders`),
          axios.get(`${API_BASE_URL}/admin/categories`),
        ]);

        const products = prodRes.data;
        const orders = orderRes.data;
        const categories = catRes.data;

        // Calculate total sales from all non-cancelled orders
        const totalSales = orders
          .filter((o) => o.status !== 'CANCELLED')
          .reduce((acc, curr) => acc + Number(curr.totalPrice), 0);

        setStats({
          totalSales,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalCategories: categories.length,
        });

        // Set top 5 recent orders for dashboard view
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to aggregate dashboard analytics. Make sure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

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
        <h1 className="text-3xl font-bold font-serif text-stone-900">Dashboard Overview</h1>
        <p className="text-stone-500 text-sm mt-1">Real-time statistics and summary of your store catalog and customer activity.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { 
            name: 'Total Sales', 
            value: `$${stats.totalSales.toFixed(2)}`, 
            desc: 'Completed sales volume', 
            color: 'bg-emerald-500/10 text-emerald-750 border-emerald-100',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          },
          { 
            name: 'Total Orders', 
            value: stats.totalOrders, 
            desc: 'Customer checkouts', 
            color: 'bg-indigo-500/10 text-indigo-750 border-indigo-100',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
          },
          { 
            name: 'Total Products', 
            value: stats.totalProducts, 
            desc: 'Catalog entries', 
            color: 'bg-amber-500/10 text-amber-750 border-amber-100',
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          },
          { 
            name: 'Categories', 
            value: stats.totalCategories, 
            desc: 'Department groups', 
            color: 'bg-stone-500/10 text-stone-700 border-stone-200',
            icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
          }
        ].map((item) => (
          <div key={item.name} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{item.name}</p>
              <h3 className="text-2xl font-bold font-serif text-stone-900 mt-2">{item.value}</h3>
              <p className="text-xs text-stone-500 mt-1">{item.desc}</p>
            </div>
            <div className={`p-3 rounded-xl border ${item.color.split(' ')[0]} ${item.color.split(' ')[2]}`}>
              <svg className={`w-6 h-6 ${item.color.split(' ')[1]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-stone-900">Recent Customer Orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-[#c5a880] hover:text-[#b4976f] hover:underline">
            View All Orders &rarr;
          </Link>
        </div>
        <div className="divide-y divide-stone-150">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-stone-500 text-sm">
              No orders placed in the system yet.
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-sm text-stone-600">
                <div className="flex flex-col items-start">
                  <p className="font-mono text-xs font-semibold text-stone-950">{order.id.slice(0, 8)}...</p>
                  <p className="text-xs text-stone-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="text-left">
                  <p className="font-semibold text-stone-900">{order.user?.name || 'Guest User'}</p>
                  <p className="text-xs text-stone-400 truncate max-w-[150px]">{order.user?.email}</p>
                </div>

                <div className="text-left hidden sm:block">
                  <p className="font-medium text-stone-700">
                    {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-stone-950">${Number(order.totalPrice).toFixed(2)}</span>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    order.status === 'PLACED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    order.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-850 border-indigo-200' :
                    order.status === 'DELIVERED' ? 'bg-green-50 text-green-800 border-green-200' :
                    'bg-stone-50 text-stone-700 border-stone-250'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
