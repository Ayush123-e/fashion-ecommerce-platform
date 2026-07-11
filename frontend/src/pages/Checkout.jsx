import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0;
    return acc + price * item.quantity;
  }, 0);

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    // Validate empty inputs
    if (
      !formData.name.trim() ||
      !formData.addressLine.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.zipCode.trim() ||
      !formData.country.trim()
    ) {
      setError('All shipping address fields are required.');
      return;
    }

    // Validate ZIP/Postal code format
    const zipClean = formData.zipCode.trim();
    if (zipClean.length < 5 || !/^[a-zA-Z0-9\s-]+$/.test(zipClean)) {
      setError('Please enter a valid Zip / Postal Code (minimum 5 characters).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5005/api/orders', {
        shippingAddress: formData // simulated payload
      });

      setSuccessOrder(response.data);
      // Synchronize cart state on context
      await fetchCart();
    } catch (err) {
      console.error('Order placement failed:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-green-50 rounded-full text-green-600 border border-green-200">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-stone-900 font-serif mb-2">Order Confirmed!</h1>
        <p className="text-stone-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {/* Order Details box */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-left mb-10 max-w-xl mx-auto shadow-sm">
          <div className="border-b border-stone-150 pb-3 mb-4 flex justify-between text-xs font-semibold text-stone-400">
            <span>ORDER NUMBER</span>
            <span className="text-stone-700 select-all">{successOrder.id}</span>
          </div>
          <div className="space-y-3 mb-4">
            {successOrder.orderItems?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-600 truncate max-w-[280px]">
                  {item.product?.name} <span className="font-bold text-stone-400">x{item.quantity}</span>
                </span>
                <span className="font-semibold text-stone-950">${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-150 pt-3 flex justify-between text-sm font-bold text-stone-950">
            <span>Total Paid</span>
            <span>${Number(successOrder.totalPrice).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/orders" 
            className="bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md text-sm"
          >
            View Order History
          </Link>
          <Link 
            to="/products" 
            className="border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 text-sm"
          >
            Keep Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-stone-900 font-serif mb-4">Checkout</h1>
        <p className="text-stone-500 mb-8 text-sm">Your shopping cart is empty. Please add items before checking out.</p>
        <Link to="/products" className="bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-stone-900 text-left font-serif mb-10">Checkout</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 text-left text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
        {/* Left Column: Shipping Address Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-950 font-serif mb-6">Shipping Address</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-850 text-sm"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Street Address</label>
                <input 
                  type="text" 
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-850 text-sm"
                  placeholder="123 Luxury Avenue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">City</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-850 text-sm"
                  placeholder="Metropolis"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">State / Region</label>
                <input 
                  type="text" 
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-850 text-sm"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">ZIP / Postal Code</label>
                <input 
                  type="text" 
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-850 text-sm"
                  placeholder="10001"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Country</label>
                <input 
                  type="text" 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-850 text-sm"
                  placeholder="United States"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Button */}
        <div className="lg:col-span-1">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-stone-900 font-serif border-b border-stone-200 pb-4 mb-4">
              Your Order
            </h2>
            
            <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 rounded bg-stone-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-stone-900 truncate max-w-[140px]">{item.product?.name}</p>
                      <p className="text-[10px] text-stone-500 font-medium">Qty {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    ${(Number(item.product?.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-4 space-y-2 mb-6 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4 mb-8 flex justify-between items-baseline">
              <span className="text-base font-semibold text-stone-900">Total</span>
              <span className="text-xl font-black text-stone-950">${total.toFixed(2)}</span>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Processing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
