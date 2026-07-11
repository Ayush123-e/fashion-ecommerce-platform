import React from 'react';

const FilterSidebar = ({
  categories = ['All', "Men's Apparel", "Women's Wear", 'Accessories'],
  selectedCategory = 'All',
  onCategoryChange,
  minPrice = '',
  onMinPriceChange,
  maxPrice = '',
  onMaxPriceChange,
  selectedSize = '',
  onSizeChange,
  onClearFilters
}) => {
  const sizes = ['S', 'M', 'L', 'XL', 'One Size'];

  return (
    <aside className="w-full md:w-64 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-left flex-shrink-0">
      <div className="flex items-center justify-between pb-4 border-b border-stone-150 mb-6">
        <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#c5a880]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </h2>
        <button
          onClick={onClearFilters}
          className="text-xs font-semibold text-[#c5a880] hover:text-[#b4976f] transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Category Section */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer text-sm text-stone-700 hover:text-stone-900 group">
              <input
                type="radio"
                name="sidebar-category"
                checked={selectedCategory === cat}
                onChange={() => onCategoryChange(cat)}
                className="w-4 h-4 border-stone-300 text-stone-950 focus:ring-stone-400 accent-stone-950"
              />
              <span className={`transition-colors ${selectedCategory === cat ? 'font-semibold text-stone-950' : ''}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="mb-6 pb-6 border-b border-stone-100">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Price Range ($)</h3>
        <div className="flex items-center gap-3">
          <div className="flex-grow">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-800"
            />
          </div>
          <span className="text-stone-400 text-xs">-</span>
          <div className="flex-grow">
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 bg-stone-50 text-stone-800"
            />
          </div>
        </div>
      </div>

      {/* Sizes Section */}
      <div>
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Filter by Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onSizeChange(isSelected ? '' : size)} // toggle selection
                className={`min-w-[40px] px-2 py-2 text-xs font-bold rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'bg-stone-950 text-white border-stone-950 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
