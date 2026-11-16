// webMenu/src/pages/MenuPage.jsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Plus, Minus, ChevronRight, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ItemDetailModal } from "../components/ItemDetailModal";

const MenuItemCard = ({ item, onAdd, cart, updateQuantity, onOpenDetail }) => {
  const hasVariants = Array.isArray(item.variants) && item.variants.length > 0;
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const currentVariant = hasVariants ? item.variants[selectedVariantIndex] : null;
  const cartItemId = currentVariant ? `${item.id}_${currentVariant.weight}` : item.id;
  const cartItem = cart.find((c) => c.id === cartItemId);

  const displayPrice = currentVariant
    ? (currentVariant.offerPrice || currentVariant.price)
    : item.price;

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(item)}
      className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex gap-4 group"
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
        <img
          src={
            item.image ||
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60"
          }
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.originalPrice && (
          <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
            OFFER
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-amber-800 transition-colors">
              {item.name}
            </h3>
          </div>
          {item.description && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
          )}

          {/* Weight Variant Selector Chips (0.5 kg, 1 kg, 1.5 kg, 2 kg) */}
          {hasVariants && (
            <div
              className="mt-2 flex flex-wrap gap-1.5 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                Weight:
              </span>
              {item.variants.map((v, idx) => {
                const isSelected = selectedVariantIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariantIndex(idx);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all border ${
                      isSelected
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    {v.weight}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base text-amber-700">₹{displayPrice}</span>
            {item.originalPrice && !currentVariant && (
              <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
            )}
          </div>

          {/* Add / Qty Controls */}
          {cartItem ? (
            <div
              className="flex items-center bg-amber-50 rounded-lg border border-amber-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(cartItemId, -1);
                }}
                className="w-7 h-7 flex items-center justify-center text-amber-800 hover:bg-amber-100 rounded-l"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-black text-xs text-amber-900">
                {cartItem.quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(cartItemId, 1);
                }}
                className="w-7 h-7 flex items-center justify-center text-amber-800 hover:bg-amber-100 rounded-r"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(item, currentVariant);
              }}
              className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const MenuPage = () => {
  const { company, categories, menuItems, cart, addToCart, updateQuantity, cartTotal, cartCount } =
    useCart();
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const navigate = useNavigate();

  // Group items section-wise by category in sequential order
  const categorySections = useMemo(() => {
    const activeCats =
      selectedCat === "all"
        ? categories
        : categories.filter((c) => c.id === selectedCat);

    return activeCats
      .map((cat, idx) => {
        const catItems = menuItems.filter((item) => {
          if (item.categoryId !== cat.id) return false;
          if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            return (
              item.name.toLowerCase().includes(q) ||
              (item.description && item.description.toLowerCase().includes(q))
            );
          }
          return true;
        });

        return {
          category: cat,
          categoryIndex: idx,
          items: catItems,
        };
      })
      .filter((sec) => sec.items.length > 0);
  }, [categories, menuItems, selectedCat, searchTerm]);

  return (
    <div
      className={`min-h-screen bg-amber-50/30 text-gray-900 transition-all ${
        cartCount > 0 ? "pb-32" : "pb-24"
      }`}
    >
      {/* Top Banner / Restaurant Header (No "Fresh Daily Bakes") */}
      <header className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              🍰
            </div>
            <div>
              <h1 className="font-black text-lg text-gray-900 leading-tight">
                {company ? company.name : "Lavino Cake Studio"}
              </h1>
              <p className="text-xs text-amber-800 font-semibold">
                {company ? company.location : "Cherupuzha"}
              </p>
            </div>
          </div>

          {/* Cart Route Link Button */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors flex items-center gap-1.5 font-bold text-xs"
          >
            <ShoppingBag className="w-5 h-5 text-amber-900" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-amber-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cakes, pastries, cupcakes..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCat === "all"
                ? "bg-amber-600 text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((cat, idx) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                  selectedCat === cat.id
                    ? "bg-amber-600 text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                #{idx + 1} {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Section-Wise Menu Items by Category */}
        {categorySections.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl">
              🎂
            </div>
            <h3 className="font-extrabold text-base text-gray-900">No Bakes Found</h3>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm
                ? `No items matched "${searchTerm}". Try another search keyword.`
                : "No items available in this category."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {categorySections.map((sec) => (
              <section key={sec.category.id} className="space-y-4">
                {/* Category Section Header */}
                <div className="flex items-center justify-between border-b-2 border-amber-200/70 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                      #{sec.categoryIndex + 1}
                    </span>
                    <h2 className="font-black text-xl text-gray-900 tracking-tight">
                      {sec.category.name}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full">
                    {sec.items.length} {sec.items.length === 1 ? "cake" : "cakes"}
                  </span>
                </div>

                {/* Section Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={addToCart}
                      cart={cart}
                      updateQuantity={updateQuantity}
                      onOpenDetail={setSelectedDetailItem}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Item Details Modal Overlay */}
      <ItemDetailModal
        item={selectedDetailItem}
        isOpen={Boolean(selectedDetailItem)}
        onClose={() => setSelectedDetailItem(null)}
        categories={categories}
      />

      {/* Floating Bottom View Cart Bar (Links to /cart route) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white rounded-2xl p-3.5 shadow-2xl shadow-amber-900/40 flex items-center justify-between transition-all active:scale-[0.98] border border-amber-400/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <span className="text-amber-300">•</span>
                  <span className="text-base font-black">₹{cartTotal}</span>
                </div>
                <p className="text-[11px] text-amber-100/90 line-clamp-1 max-w-[200px] sm:max-w-[260px]">
                  {cart.map((c) => `${c.quantity}x ${c.name}${c.variant ? ` (${c.variant})` : ''}`).join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white text-amber-900 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:bg-amber-50">
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4 text-amber-800" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
