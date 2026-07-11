import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';

// Simple mockup pages
const Home = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartAddingId, setCartAddingId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5005/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Could not load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', 'Men', 'Women', 'Accessories'];

  // Filter products by category (with explicit mappings to avoid 'women' matching 'men')
  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'All') return true;
    
    const catName = product.category?.name?.toLowerCase() || '';
    const selCat = selectedCategory.toLowerCase();
    
    if (selCat === 'men') {
      return catName === "men's apparel" || catName === 'men';
    }
    if (selCat === 'women') {
      return catName === "women's wear" || catName === 'women';
    }
    
    return catName === selCat;
  });

  const scrollToCatalog = (category = 'All') => {
    setSelectedCategory(category);
    setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setCartAddingId(product.id);
    const result = await addToCart(product.id, 1);
    setCartAddingId(null);

    if (result.success) {
      alert(`"${product.name}" has been added to your cart!`);
    } else {
      alert(result.error || 'Could not add item to cart. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-stone-900 to-stone-850 text-white p-8 md:p-16 mb-16 shadow-xl border border-stone-800">
        <div className="max-w-xl">
          <span className="text-[#c5a880] font-semibold tracking-widest text-xs uppercase">New Collection 2026</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6 leading-tight font-sans">Elevate Your Style, Effortlessly.</h1>
          <p className="text-stone-300 mb-8 text-base md:text-lg font-light leading-relaxed">
            Discover curated apparel designed for modern comfort and timeless appeal. Crafted with premium materials for the conscious consumer.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => scrollToCatalog('All')}
              className="bg-[#c5a880] hover:bg-[#b4976f] text-stone-950 font-semibold px-6 py-3 rounded-lg transition-all duration-300"
            >
              Shop The Look
            </button>
            <button 
              onClick={() => scrollToCatalog('All')}
              className="border border-stone-500 hover:border-white hover:bg-stone-800/50 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
            >
              Browse Collections
            </button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 text-left">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Men', desc: 'Tailored suiting & premium staples', bg: 'from-stone-200 to-stone-300' },
            { name: 'Women', desc: 'Fluid silk, dresses & elegant knits', bg: 'from-amber-100 to-amber-200' },
            { name: 'Accessories', desc: 'Handcrafted leather bags & watches', bg: 'from-orange-100 to-orange-200' }
          ].map((cat, idx) => (
            <div 
              key={idx} 
              onClick={() => scrollToCatalog(cat.name)}
              className="group relative rounded-xl overflow-hidden bg-gradient-to-br p-6 h-64 flex flex-col justify-end shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.bg} opacity-80 group-hover:scale-105 transition-transform duration-500`}></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-stone-950">{cat.name}</h3>
                <p className="text-stone-700 text-sm mt-1 mb-4">{cat.desc}</p>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-950 group-hover:underline">Explore &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog Section */}
      <div id="catalog" className="pt-8 border-t border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-left">Shop Our Catalog</h2>
            <p className="text-stone-500 text-sm mt-1 text-left">Explore high-quality conscious essentials.</p>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-stone-950 text-white border-stone-950'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#c5a880]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 font-medium text-left">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            No products found matching the criteria.
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-300 flex flex-col hover:shadow-md"
              >
                {/* Image */}
                <Link to={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-stone-100 block">
                  <img 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      Low Stock
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 left-2 bg-stone-500 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      Out of Stock
                    </span>
                  )}
                </Link>

                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-left">
                    {product.category?.name || 'Catalog'}
                  </span>
                  <h3 className="font-serif text-base font-bold text-stone-900 mt-1 mb-2 text-left line-clamp-2 min-h-[48px] hover:underline">
                    <Link to={`/products/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-semibold text-stone-950">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0 || cartAddingId === product.id}
                      className="bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {cartAddingId === product.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const About = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 text-center">
    <h1 className="text-4xl font-bold mb-6 text-stone-900">Our Philosophy</h1>
    <p className="text-stone-600 leading-relaxed mb-8">
      We believe that fashion should be sustainable, inclusive, and built to last. Our team collaborates with artisans across the globe to bring you high-quality garments that adapt to your lifestyle.
    </p>
    <Link to="/" className="text-[#c5a880] hover:text-[#b4976f] hover:underline font-semibold">&larr; Back to Shop</Link>
  </div>
);

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

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

  return user && user.role === 'ADMIN' ? children : null;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      {/* Dynamic Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Secure Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-white font-serif text-lg tracking-widest font-bold">AURA</span>
          <p className="text-sm">&copy; 2026 AURA Fashion Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <AppContent />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
