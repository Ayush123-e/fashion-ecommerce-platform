import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import FilterSidebar from '../components/FilterSidebar';
import { useWishlist } from '../context/WishlistContext';

const API_BASE_URL = 'http://localhost:5005/api';

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartAddingId, setCartAddingId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Extract query filters and page indexing from URL search params
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const selectedSize = searchParams.get('size') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query string based on URL parameters
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('search', searchQuery);
        if (selectedCategory !== 'All') queryParams.set('category', selectedCategory);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);
        if (selectedSize) queryParams.set('size', selectedSize);
        if (sortBy) queryParams.set('sortBy', sortBy);

        // Append page and limit parameters
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '9'); // 9 products per page

        const response = await axios.get(`${API_BASE_URL}/products?${queryParams.toString()}`);
        
        // Map paginated response fields
        if (response.data && response.data.products !== undefined) {
          setProducts(response.data.products);
          setTotalPages(response.data.totalPages || 1);
        } else {
          // Fallback array mapping
          setProducts(Array.isArray(response.data) ? response.data : []);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Could not fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchQuery, selectedCategory, minPrice, maxPrice, selectedSize, sortBy, currentPage]);

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    params.delete('page'); // Reset to page 1 on filter changes
    setSearchParams(params);
    setIsMobileFiltersOpen(false); // Close filters drawer on selection
  };

  const handleMinPriceChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (!val) {
      params.delete('minPrice');
    } else {
      params.set('minPrice', val);
    }
    params.delete('page'); // Reset to page 1 on filter changes
    setSearchParams(params);
  };

  const handleMaxPriceChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (!val) {
      params.delete('maxPrice');
    } else {
      params.set('maxPrice', val);
    }
    params.delete('page'); // Reset to page 1 on filter changes
    setSearchParams(params);
  };

  const handleSizeChange = (size) => {
    const params = new URLSearchParams(searchParams);
    if (!size) {
      params.delete('size');
    } else {
      params.set('size', size);
    }
    params.delete('page'); // Reset to page 1 on filter changes
    setSearchParams(params);
    setIsMobileFiltersOpen(false); // Close filters drawer on selection
  };

  const handleSortChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val === 'newest') {
      params.delete('sortBy');
    } else {
      params.set('sortBy', val);
    }
    params.delete('page'); // Reset to page 1 on filter changes
    setSearchParams(params);
  };

  const handlePageChange = (pageNum) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNum.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('search', searchQuery); // keep search text query
    }
    setSearchParams(params);
    setIsMobileFiltersOpen(false); // Close filters drawer on reset
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.delete('page');
    setSearchParams(params);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setCartAddingId(product.id);
      await axios.post(`${API_BASE_URL}/cart`, {
        productId: product.id,
        quantity: 1
      });
      alert(`"${product.name}" has been added to your cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.message || 'Could not add item to cart. Please try again.');
    } finally {
      setCartAddingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title & Sorting Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-stone-900 font-serif">
            {selectedCategory === 'All' ? 'Our Collection' : `${selectedCategory}`}
          </h1>
          <p className="text-stone-500 text-sm mt-1">Explore high-quality, sustainably crafted essentials.</p>
        </div>

        {/* Sort Selection Menu */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-stone-200 bg-white rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#c5a880] text-stone-800 cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Search results banner */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl">
          <span className="text-sm text-stone-600">
            Showing results for "<span className="font-semibold text-stone-900">{searchQuery}</span>"
          </span>
          <button
            onClick={handleClearSearch}
            className="text-xs text-[#c5a880] hover:text-[#b4976f] font-semibold"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Mobile Filters Drawer Trigger Button */}
      <button
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        className="md:hidden w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm mb-6 shadow-sm transition"
      >
        <svg className="w-4.5 h-4.5 text-[#c5a880]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filter Sidebar & Products Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Collapsible Filter Sidebar Container */}
        <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block w-full md:w-auto`}>
          <FilterSidebar
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            minPrice={minPrice}
            onMinPriceChange={handleMinPriceChange}
            maxPrice={maxPrice}
            onMaxPriceChange={handleMaxPriceChange}
            selectedSize={selectedSize}
            onSizeChange={handleSizeChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Products Grid Content */}
        <div className="flex-grow w-full">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <svg className="animate-spin h-8 w-8 text-[#c5a880]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600 font-medium text-left">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-stone-500 font-medium">
              No products match your search or filter criteria. Try adjusting filters.
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-300 flex flex-col hover:shadow-md"
                  >
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-stone-100 block">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Wishlist Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!user) {
                            navigate('/login');
                            return;
                          }
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 transition-all duration-300 z-10 drop-shadow"
                        aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <svg
                          className={`w-6 h-6 transition-all duration-300 active:scale-125 ${
                            isInWishlist(product.id)
                              ? 'text-pink-500 fill-pink-500 scale-110'
                              : 'text-white fill-white/70 hover:text-pink-400 hover:fill-pink-400'
                          }`}
                          stroke={isInWishlist(product.id) ? '#ec4899' : 'currentColor'}
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                      </button>

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

                    {/* Product Details */}
                    <div className="p-4 flex flex-col flex-grow text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          {product.category?.name || 'Catalog'}
                        </span>
                        {product.sizes && product.sizes.length > 0 && (
                          <span className="text-[9px] font-medium text-stone-450">
                            Sizes: {product.sizes.join(', ')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-base font-bold text-stone-900 mt-1 mb-2 line-clamp-2 min-h-[48px] hover:underline">
                        <Link to={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-stone-950">
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 border-t border-stone-200 pt-8">
                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-600 disabled:opacity-45 disabled:cursor-not-allowed transition bg-white"
                    aria-label="Previous Page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isActive = p === currentPage;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? 'bg-stone-950 text-white shadow-sm'
                            : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-600 disabled:opacity-45 disabled:cursor-not-allowed transition bg-white"
                    aria-label="Next Page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
