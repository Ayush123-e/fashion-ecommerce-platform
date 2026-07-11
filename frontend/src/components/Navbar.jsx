import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Sync search input with URL search param changes
  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
    setSuggestions([]);
    setShowDropdown(false);
    setIsMobileMenuOpen(false); // Auto close mobile drawer on route update
  }, [searchParams]);

  // Debounced suggestion fetching
  useEffect(() => {
    if (!searchVal.trim() || searchVal.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await axios.get(`http://localhost:5005/api/products?search=${encodeURIComponent(searchVal)}`);
        setSuggestions(response.data.slice(0, 5)); // top 5 suggestions
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchVal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(searchVal)}`);
  };

  const handleMobileLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo and Desk links */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-950 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link to="/" className="text-2xl font-black tracking-widest text-stone-950 font-serif">
            AURA
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors">Shop</Link>
            <Link to="/about" className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors">About</Link>
          </nav>
        </div>
        
        {/* Right Side: Search & Utility icons */}
        <div className="flex items-center gap-4">
          {/* Search Input (Desktop) */}
          <form onSubmit={handleSubmit} className="hidden sm:block relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchVal}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 250)}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setShowDropdown(true);
              }}
              className="border border-stone-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-800 w-64"
            />
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white border border-stone-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                <p className="text-[10px] font-bold text-stone-400 px-4 py-1.5 uppercase tracking-wider text-left bg-stone-50 border-b border-stone-150 mb-1">
                  Suggestions
                </p>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearchVal(item.name);
                      setShowDropdown(false);
                      navigate(`/products?search=${encodeURIComponent(item.name)}`);
                    }}
                    className="w-full px-4 py-2 hover:bg-stone-50 transition-colors flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded overflow-hidden bg-stone-100 flex-shrink-0">
                      <img 
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden flex-grow">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        {item.category?.name || 'Product'} • ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
          
          {/* Wishlist Link */}
          {user && (
            <Link to="/wishlist" className="p-2 text-stone-600 hover:text-stone-950 relative" aria-label="View wishlist">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white bg-amber-600 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
          )}

          {/* Shopping Cart Link */}
          <Link to="/cart" className="p-2 text-stone-600 hover:text-stone-950 relative" aria-label="View shopping cart">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItemsCount > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white bg-red-650 rounded-full">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Auth Links (Desktop) */}
          <div className="hidden md:flex items-center gap-4 pl-2 border-l border-stone-200">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="text-xs font-semibold uppercase tracking-wider text-amber-700 hover:text-amber-900 hover:underline transition-colors mr-1"
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  to="/orders" 
                  className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-950 hover:underline transition-colors"
                >
                  Orders
                </Link>
                <span className="text-sm text-stone-700 font-medium pl-2 border-l border-stone-150">
                  Hi, {user.name ? user.name.split(' ')[0] : 'User'}
                </span>
                <button 
                  onClick={logout}
                  className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-950 hover:underline transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-6 space-y-6 shadow-md text-left animate-fade-in-down">
          {/* Mobile Search */}
          <form onSubmit={handleSubmit} className="relative w-full">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-800 w-full"
            />
          </form>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4 font-semibold text-stone-700">
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-950 py-1.5 border-b border-stone-50">Shop</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-950 py-1.5 border-b border-stone-50">About</Link>
            
            {user ? (
              <>
                <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-950 py-1.5 border-b border-stone-50">My Orders</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-amber-700 hover:text-amber-900 py-1.5 border-b border-stone-50">Admin Panel</Link>
                )}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-450 uppercase">User: {user.name || user.email}</span>
                  <button 
                    onClick={handleMobileLogout}
                    className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border border-stone-200 text-stone-700 py-2.5 rounded-xl font-semibold hover:bg-stone-50 text-center text-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-stone-950 hover:bg-stone-800 text-white py-2.5 rounded-xl font-semibold text-center text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
