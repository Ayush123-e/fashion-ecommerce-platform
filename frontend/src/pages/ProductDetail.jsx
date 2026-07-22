import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductImage from '../components/ProductImage';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartAdding, setCartAdding] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:5005/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Could not fetch product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setCartAdding(true);
    const result = await addToCart(product.id, quantity);
    setCartAdding(false);

    if (result.success) {
      alert(`Successfully added ${quantity} item(s) to your cart.`);
    } else {
      alert(result.error || 'Could not add to cart. Please try again.');
    }
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

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Error Loading Product</h2>
        <p className="text-red-650 font-medium mb-8">{error || 'Product not found.'}</p>
        <Link to="/products" className="text-[#c5a880] hover:text-[#b4976f] font-semibold hover:underline">
          &larr; Back to Shop Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <div className="mb-8 text-left">
        <Link to="/products" className="text-sm font-medium text-stone-500 hover:text-stone-950 transition-colors flex items-center gap-1">
          &larr; Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Product Image */}
        <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50 aspect-[3/4]">
          <ProductImage 
            src={product.images?.[0]} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col text-left justify-center">
          <span className="text-xs font-bold text-[#c5a880] uppercase tracking-widest">
            {product.category?.name || 'Catalog'}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-950 mt-2 mb-4 leading-tight">
            {product.name}
          </h1>
          
          <p className="text-2xl font-semibold text-stone-950 mb-6">
            ${Number(product.price).toFixed(2)}
          </p>

          {/* Stock Badges */}
          <div className="mb-6">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Low Stock (Only {product.stock} items left)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                In Stock ({product.stock} available)
              </span>
            )}
          </div>

          <div className="border-t border-stone-200 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-stone-900 mb-2">Description</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Interactive controls */}
          {!isOutOfStock && (
            <div className="border-t border-stone-200 pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-stone-900">Quantity</span>
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white shadow-sm">
                  <button 
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium text-stone-900 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={cartAdding}
                  className="flex-1 sm:flex-none bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 py-3.5 px-12 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md flex justify-center items-center gap-3 disabled:opacity-50"
                >
                  {cartAdding ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {cartAdding ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                {/* Heart Wishlist Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    toggleWishlist(product.id);
                  }}
                  aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl border border-stone-200 hover:border-pink-300 bg-white hover:bg-pink-50 transition-all duration-300 shadow-sm group"
                >
                  <svg
                    className={`w-6 h-6 transition-all duration-300 ${
                      isInWishlist(product.id)
                        ? 'text-pink-500 fill-pink-500 scale-110'
                        : 'text-stone-400 fill-transparent group-hover:text-pink-400 group-hover:fill-pink-100'
                    }`}
                    stroke={isInWishlist(product.id) ? '#ec4899' : 'currentColor'}
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  <span className={`text-sm font-medium ${
                    isInWishlist(product.id) ? 'text-pink-500' : 'text-stone-500 group-hover:text-pink-400'
                  }`}>
                    {isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
