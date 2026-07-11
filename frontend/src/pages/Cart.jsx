import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, loading, error, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0;
    return acc + price * item.quantity;
  }, 0);

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    navigate('/checkout');
  };

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

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-stone-100 rounded-full text-stone-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2 font-serif">Your Cart is Empty</h1>
        <p className="text-stone-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Discover curated premium essentials and find garments designed for modern comfort.
        </p>
        <Link 
          to="/products" 
          className="inline-block bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-stone-900 text-left font-serif mb-10">Shopping Bag</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 text-left text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div 
                key={item.productId}
                className="flex flex-col sm:flex-row gap-6 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-stone-300 transition-colors"
              >
                {/* Image */}
                <Link 
                  to={`/products/${item.productId}`}
                  className="w-full sm:w-28 h-36 rounded-xl overflow-hidden bg-stone-50 border border-stone-150 flex-shrink-0"
                >
                  <img 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details info */}
                <div className="flex-grow flex flex-col justify-between text-left">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-serif text-lg font-bold text-stone-900 hover:underline">
                        <Link to={`/products/${item.productId}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="text-stone-400 hover:text-red-650 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1 block">
                      Category: {product.category?.name || 'Catalog'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 font-medium text-stone-900 text-sm min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= product.stock}
                        className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-stone-500">
                        ${Number(product.price).toFixed(2)} each
                      </p>
                      <p className="text-base font-bold text-stone-950 mt-0.5">
                        ${(Number(product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm sticky top-24 text-left">
            <h2 className="text-xl font-bold text-stone-900 font-serif border-b border-stone-200 pb-4 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3.5 mb-6 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-stone-900">
                  {shipping === 0 ? (
                    <span className="text-green-600 font-bold uppercase tracking-wider text-xs">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[11px] text-stone-400 italic">
                  Add <span className="font-bold text-stone-500">${(150 - subtotal).toFixed(2)}</span> more to receive free shipping.
                </p>
              )}
            </div>

            <div className="border-t border-stone-200 pt-4 mb-8 flex justify-between items-baseline">
              <span className="text-base font-semibold text-stone-900">Total</span>
              <span className="text-2xl font-black text-stone-950">${total.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md flex justify-center items-center gap-2"
            >
              Proceed to Checkout
            </button>

            <Link 
              to="/products"
              className="mt-4 block text-center text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-950 transition-colors"
            >
              &larr; Keep Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
