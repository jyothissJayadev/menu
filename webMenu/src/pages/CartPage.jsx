// webMenu/src/pages/CartPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-amber-50/30 text-gray-900 pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors text-amber-900"
              title="Return to Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-extrabold text-lg text-gray-900 leading-tight">Your Cake Cart</h1>
              <p className="text-[11px] text-gray-500 font-medium">Lavino Cake Studio • Cherupuzha</p>
            </div>
          </div>

          {cartCount > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 shadow-sm my-6">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 opacity-40 text-amber-700" />
            </div>
            <h2 className="font-extrabold text-xl text-gray-900">Your Cart is Empty</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              You haven't selected any cakes yet. Browse our freshly baked collection and treat yourself!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Explore Cake Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Items Card */}
            <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  Selected Cakes ({cartCount})
                </h2>
                <span className="text-xs font-bold text-amber-700">Cherupuzha Bakery</span>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    {/* Item Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=60"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                        {item.variant && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-200">
                            {item.variant}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-amber-700 mt-0.5">
                        ₹{item.price} each • Subtotal: ₹{item.price * item.quantity}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-amber-50 rounded-lg border border-amber-200">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-amber-800 hover:bg-amber-100 rounded-l active:scale-95"
                        title={item.quantity === 1 ? "Deselect / Remove" : "Decrease"}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-black text-xs text-amber-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => item.quantity < 5 && updateQuantity(item.id, 1)}
                        disabled={item.quantity >= 5}
                        className={`w-7 h-7 flex items-center justify-center rounded-r transition-colors ${
                          item.quantity >= 5
                            ? "text-gray-300 cursor-not-allowed bg-amber-50/50"
                            : "text-amber-800 hover:bg-amber-100 active:scale-95"
                        }`}
                        title={item.quantity >= 5 ? "Max 5 reached" : "Increase"}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm space-y-2">
              <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                Bill Details
              </h2>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Item Total ({cartCount} items)</span>
                <span className="font-semibold text-gray-900">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Bakery Packaging</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between text-base font-black text-gray-900">
                <span>Total Amount to Pay</span>
                <span className="text-amber-700 text-lg">₹{cartTotal}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <div className="pt-2">
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-base shadow-lg shadow-amber-600/30 transition-all active:scale-[0.98] flex items-center justify-between px-6"
              >
                <div className="text-left">
                  <p className="text-[11px] uppercase tracking-wider text-amber-200 font-bold">
                    Next: Enter Customer Details
                  </p>
                  <p className="text-base font-black">Place Order • ₹{cartTotal}</p>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl font-bold text-xs">
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
