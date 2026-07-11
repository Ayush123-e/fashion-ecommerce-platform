import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/orders/my-orders`);
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError(err.response?.data?.message || 'Could not fetch order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED') {
      const confirmCancel = window.confirm('Are you sure you want to cancel this order? This action cannot be undone.');
      if (!confirmCancel) return;
    }

    try {
      setActionLoadingId(orderId);
      const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
        status: newStatus
      });
      
      // Update local orders list state instantly
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? { ...o, status: response.data.status } : o))
      );
      alert(`Order status updated successfully to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-850 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-750 border-red-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-250';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Steps sequence for tracking order progress
  const trackingSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const getStepIndex = (status) => trackingSteps.indexOf(status);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <svg className="animate-spin h-8 w-8 text-[#c5a880]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-stone-100 rounded-full text-stone-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2 font-serif">No Orders Found</h1>
        <p className="text-stone-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          You haven't placed any orders yet. Discover timeless pieces to express your unique style.
        </p>
        <Link 
          to="/products" 
          className="inline-block bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md text-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      <h1 className="text-3xl font-bold text-stone-900 font-serif mb-10">Order History</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-10">
        {orders.map((order) => {
          const currentStep = getStepIndex(order.status);
          const isCancelled = order.status === 'CANCELLED';

          return (
            <div 
              key={order.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="bg-stone-50 border-b border-stone-150 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-sm text-stone-600">
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date Placed</p>
                    <p className="font-medium text-stone-800 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Amount</p>
                    <p className="font-semibold text-stone-950 mt-0.5">${Number(order.totalPrice).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order ID</p>
                    <p className="font-mono text-xs text-stone-500 mt-1 select-all">{order.id}</p>
                  </div>
                </div>
                
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(order.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {order.status}
                </span>
              </div>

              {/* Order Tracking Visual Stepper */}
              <div className="px-6 py-6 border-b border-stone-150 bg-stone-50/50">
                {isCancelled ? (
                  <div className="flex items-center justify-center gap-2 bg-red-50 text-red-800 border border-red-200 py-3.5 px-4 rounded-xl text-sm font-semibold">
                    <svg className="w-5 h-5 text-red-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>This order has been cancelled and cannot be processed further.</span>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-6 text-left">Order Lifecycle Progress</h4>
                    
                    {/* Stepper Grid wrapper */}
                    <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto px-4 sm:px-8">
                      {/* Connecting Line */}
                      <div className="absolute left-8 right-8 top-4 h-0.5 bg-stone-200 -z-10">
                        <div 
                          className="h-full bg-stone-950 transition-all duration-500" 
                          style={{ width: `${(Math.max(0, currentStep) / (trackingSteps.length - 1)) * 100}%` }}
                        ></div>
                      </div>

                      {/* Step Bubbles */}
                      {trackingSteps.map((step, index) => {
                        const isDone = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                          <div key={step} className="flex flex-col items-center relative">
                            {/* Circle Bubble */}
                            <div 
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                                isDone 
                                  ? 'bg-stone-950 text-white border-stone-950 shadow-sm'
                                  : 'bg-white text-stone-400 border-stone-200'
                              } ${isCurrent ? 'ring-4 ring-[#c5a880]/30 scale-110' : ''}`}
                            >
                              {isDone && !isCurrent ? (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                index + 1
                              )}
                            </div>
                            {/* Step Label */}
                            <span 
                              className={`text-[10px] sm:text-xs font-semibold mt-2 uppercase tracking-wider transition ${
                                isDone ? 'text-stone-900 font-bold' : 'text-stone-400'
                              }`}
                            >
                              {step.toLowerCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Content - Items List */}
              <div className="divide-y divide-stone-150 px-6">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded bg-stone-50 border border-stone-150 overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                          {item.product?.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-1 font-medium">
                          Qty: {item.quantity} • price at purchase: ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <span className="text-sm font-bold text-stone-950">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Actions footer panel */}
              {!isCancelled && order.status !== 'DELIVERED' && (
                <div className="bg-stone-50/50 border-t border-stone-150 px-6 py-4 flex justify-end gap-3">
                  {/* Cancel Button - Pending / Processing */}
                  {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                      disabled={actionLoadingId === order.id}
                      className="border border-red-200 text-red-650 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      {actionLoadingId === order.id ? 'Updating...' : 'Cancel Order'}
                    </button>
                  )}

                  {/* Complete Button - Shipped */}
                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                      disabled={actionLoadingId === order.id}
                      className="bg-stone-950 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                    >
                      {actionLoadingId === order.id ? 'Updating...' : 'Confirm Delivery'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
