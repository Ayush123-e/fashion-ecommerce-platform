import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, loading, error } = useWishlist();
  const { addToCart } = useCart();
  const [movingId, setMovingId] = useState(null);

  const handleMoveToCart = async (productId, productName) => {
    try {
      setMovingId(productId);
      const res = await addToCart(productId, 1);
      if (res.success) {
        await removeFromWishlist(productId);
        alert(`"${productName}" moved to your shopping cart!`);
      } else {
        alert(res.error || 'Could not move item to cart.');
      }
    } catch (err) {
      console.error('Error moving item to cart:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setMovingId(null);
    }
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-left">
          <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">Access Denied</h2>
          <p className="text-stone-500 text-sm mb-6">Please log in or sign up to view and manage your saved items.</p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="flex-grow bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 text-center py-2.5 rounded-xl font-semibold transition-all duration-300 text-sm"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="flex-grow border border-stone-200 text-stone-600 text-center py-2.5 rounded-xl font-semibold hover:bg-stone-50 transition text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      <div className="border-b border-stone-200 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-serif">Saved Items</h1>
        <p className="text-stone-500 text-sm mt-1">Keep track of the pieces you love and add them to your cart anytime.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <svg className="animate-spin h-8 w-8 text-[#c5a880]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 px-4 py-3.5 rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-24 bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <svg className="w-12 h-12 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-lg font-bold text-stone-900 font-serif">Your Wishlist is Empty</h2>
          <p className="text-stone-500 text-sm mt-1 mb-6">Explore our latest collections and tap the heart icon to save products here.</p>
          <Link
            to="/products"
            className="inline-block bg-stone-950 hover:bg-[#c5a880] hover:text-stone-950 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div
                key={item.productId}
                className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-300 flex flex-col hover:shadow-md relative"
              >
                {/* Product Image */}
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

                {/* Remove button overlay */}
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-red-500 transition-all duration-200 shadow-sm z-10"
                  title="Remove from wishlist"
                >
                  <svg className="w-4.5 h-4.5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Product Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    {product.category?.name || 'Catalog'}
                  </span>
                  <h3 className="font-serif text-base font-bold text-stone-900 mt-1 mb-2 line-clamp-2 min-h-[48px] hover:underline">
                    <Link to={`/products/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-center justify-between mt-auto mb-4">
                    <span className="text-sm font-bold text-stone-950">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleMoveToCart(product.id, product.name)}
                      disabled={product.stock === 0 || movingId === product.id}
                      className="bg-stone-950 hover:bg-[#c5a880] text-white hover:text-stone-950 py-2 rounded-xl text-xs font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {movingId === product.id ? (
                        'Moving...'
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Move to Cart
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="border border-stone-200 text-stone-600 hover:text-red-650 hover:bg-stone-50 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
