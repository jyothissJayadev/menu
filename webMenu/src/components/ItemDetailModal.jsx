// webMenu/src/components/ItemDetailModal.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Minus, ShoppingBag, Sparkles, Check } from "lucide-react";
import { useCart } from "../context/CartContext";

export const ItemDetailModal = ({ item, isOpen, onClose, categories = [] }) => {
  const { cart, setItemQuantity, removeFromCart } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const hasVariants = Boolean(item && Array.isArray(item.variants) && item.variants.length > 0);
  const currentVariant = hasVariants ? item.variants[selectedVariantIndex] : null;

  const currentPrice = currentVariant
    ? (currentVariant.offerPrice || currentVariant.price)
    : item ? item.price : 0;

  const cartItemId = item
    ? currentVariant
      ? `${item.id}_${currentVariant.weight}`
      : item.id
    : "";

  const existingInCart = cart.find((c) => c.id === cartItemId);

  // Reset variant index when modal opens with a new item
  useEffect(() => {
    if (isOpen) {
      setSelectedVariantIndex(0);
    }
  }, [isOpen, item?.id]);

  // Sync quantity state when opened, item changed, or variant changed
  useEffect(() => {
    if (item && isOpen) {
      if (existingInCart) {
        setQuantity(existingInCart.quantity);
      } else {
        setQuantity(1);
      }
      setAddedAnimation(false);
    }
  }, [item?.id, isOpen, selectedVariantIndex, existingInCart?.id]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const categoryObj = categories.find((c) => String(c.id) === String(item.categoryId));
  const categoryName = categoryObj ? categoryObj.name : "Cake Special";

  const handleDecrease = () => {
    setQuantity((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0 && existingInCart) {
        removeFromCart(cartItemId);
      }
      return next;
    });
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(5, prev + 1));
  };

  const handleAddToCart = () => {
    if (quantity === 0) {
      if (existingInCart) {
        removeFromCart(cartItemId);
      }
      onClose();
      return;
    }

    setItemQuantity(item, currentVariant, quantity);

    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 400);
  };

  const totalPrice = currentPrice * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-md"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Large Cake Photo Header */}
          <div className="relative w-full h-64 sm:h-72 bg-amber-50">
            <img
              src={
                item.image ||
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80"
              }
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Badges on image */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
              <span className="bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                {categoryName}
              </span>
              {item.originalPrice && !currentVariant && (
                <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>SPECIAL OFFER</span>
                </span>
              )}
            </div>
          </div>

          {/* Details Content */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Title & Pricing */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {item.name}
              </h2>
              <div className="flex items-baseline gap-2.5 mt-1.5">
                <span className="text-2xl font-black text-amber-700">₹{currentPrice}</span>
                {item.originalPrice && !currentVariant && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{item.originalPrice}
                  </span>
                )}
                {existingInCart && (
                  <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {existingInCart.quantity} already in cart
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description ? (
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3.5">
                <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1">
                  Cake Description & Flavor
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            ) : null}

            {/* Weight / Size Variants Chips */}
            {hasVariants && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider block">
                  Select Cake Weight / Size *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {item.variants.map((v, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    const vPrice = v.offerPrice || v.price;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 shadow-md font-black scale-[1.02]"
                            : "bg-gray-50 hover:bg-amber-50/70 text-gray-800 border-gray-200 font-bold"
                        }`}
                      >
                        <p className="text-xs">{v.weight}</p>
                        <p
                          className={`text-sm mt-0.5 ${
                            isSelected ? "text-amber-100" : "text-amber-700 font-extrabold"
                          }`}
                        >
                          ₹{vPrice}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector Section */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Quantity
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">
                    Max 5
                  </span>
                </div>
                <span className="text-xs font-semibold mt-0.5 block">
                  {quantity === 0 ? (
                    <span className="text-red-500 font-bold">Cake Deselected</span>
                  ) : (
                    <span className="text-amber-800">
                      Subtotal: ₹{totalPrice} {quantity === 5 && <span className="text-gray-400 font-normal">(Max limit)</span>}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity === 0}
                  className={`w-9 h-9 rounded-lg shadow-xs flex items-center justify-center transition-all ${
                    quantity === 0
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 active:scale-95"
                  }`}
                  title={quantity === 1 ? "Deselect cake" : "Decrease quantity"}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className={`w-10 text-center font-black text-sm ${quantity === 0 ? "text-red-500" : "text-gray-900"}`}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= 5}
                  className={`w-9 h-9 rounded-lg shadow-xs flex items-center justify-center transition-all ${
                    quantity >= 5
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 active:scale-95"
                  }`}
                  title={quantity >= 5 ? "Maximum 5 cakes" : "Increase quantity"}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Add To Cart Action */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shadow-lg shrink-0">
          {quantity === 0 ? (
            <button
              type="button"
              disabled={true}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Cake Deselected • Select 1 to 5 to Add</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-between shadow-lg transition-all active:scale-[0.98] ${
                addedAnimation
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {addedAnimation ? (
                  <Check className="w-5 h-5 animate-bounce" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                <span>
                  {addedAnimation
                    ? "Added to Cart!"
                    : existingInCart
                    ? `Update Cart (${quantity})`
                    : `Add ${quantity} to Cart`}
                </span>
              </div>
              <span className="text-base font-black">₹{totalPrice}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
