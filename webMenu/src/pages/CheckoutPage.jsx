// webMenu/src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, User, Phone, Calendar, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api";

const extract10Digits = (val) => {
  if (!val) return "";
  let digits = String(val).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

const isValidIndianMobile = (p) => /^[6-9]\d{9}$/.test(p);

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CheckoutPage = () => {
  const { cart, cartTotal, cartCount, clearCart, company, customerDetails, setCustomerDetails } =
    useCart();
  const navigate = useNavigate();

  const [name, setName] = useState(customerDetails.name || "");
  const [phone, setPhone] = useState(() => extract10Digits(customerDetails.phone || ""));
  const [dateType, setDateType] = useState("today"); // "today" | "tomorrow" | "custom"
  const [customDate, setCustomDate] = useState(getTodayDateString());
  const [orderTime, setOrderTime] = useState("ASAP (~30m)");
  const [notes, setNotes] = useState(customerDetails.notes || "");
  const [isPlacing, setIsPlacing] = useState(false);

  // If cart is empty on mount/reload, redirect to cart page
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cart, navigate]);

  // Keep customerDetails state synced to context/localStorage
  const handleNameChange = (val) => {
    setName(val);
    setCustomerDetails((prev) => ({ ...prev, name: val }));
  };

  const handlePhoneChange = (raw) => {
    const cleaned = extract10Digits(raw);
    setPhone(cleaned);
    setCustomerDetails((prev) => ({
      ...prev,
      phone: cleaned ? `+91 ${cleaned}` : "",
    }));
  };

  const handleNotesChange = (val) => {
    setNotes(val);
    setCustomerDetails((prev) => ({ ...prev, notes: val }));
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      alert("Please enter your mobile phone number.");
      return;
    }
    if (!isValidIndianMobile(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9847123456).");
      return;
    }

    setIsPlacing(true);
    try {
      const companyId = company ? company._id : "6af8890bb0d5cb3fd1c686bc";
      const resolvedDate =
        dateType === "today"
          ? "Today"
          : dateType === "tomorrow"
          ? "Tomorrow"
          : customDate || "Today";

      const payload = {
        name: name.trim(),
        phone: `+91 ${phone.trim()}`,
        date: resolvedDate,
        time: orderTime.trim() || "ASAP",
        table: "Takeaway",
        notes: notes.trim(),
        items: cart.map((i) => ({
          itemId: i.originalItemId || i.id,
          name: i.name,
          variant: i.variant || (i.selectedVariant ? i.selectedVariant.weight : ""),
          qty: i.quantity,
          price: i.price,
          addons: [],
        })),
      };

      const createdOrder = await createOrder(companyId, payload);
      if (createdOrder) {
        clearCart();
        // Navigate to dedicated live tracking route!
        navigate(`/order/${createdOrder._id}`, { replace: true });
      }
    } catch (err) {
      alert("Error placing order: " + (err.message || "Please try again"));
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors text-amber-900"
              title="Return to Cart"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-extrabold text-lg text-gray-900 leading-tight">Customer Details</h1>
              <p className="text-[11px] text-amber-800 font-medium">Step 2 of 2 • Lavino Cake Studio</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full">
            ₹{cartTotal}
          </span>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-xl mx-auto px-4 pt-4">
        <form onSubmit={handleConfirmOrder} className="space-y-4">
          {/* Order Summary Reminder */}
          <div className="bg-amber-100/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Order for {cartCount} {cartCount === 1 ? "cake" : "cakes"}
              </p>
              <p className="text-xs text-amber-800 mt-0.5 line-clamp-1">
                {cart.map((c) => `${c.quantity}x ${c.name}${c.variant ? ` (${c.variant})` : ''}`).join(", ")}
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-900">₹{cartTotal}</span>
              <p className="text-[10px] text-emerald-700 font-bold">Packaging Free</p>
            </div>
          </div>

          {/* Form Fields Card */}
          <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm space-y-4">
            <h2 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Contact & Dining Details</span>
            </h2>

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Your Full Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
            </div>

            {/* Phone with fixed Indian +91 prefix and 10 digits validation */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mobile Phone Number *</span>
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">10-Digit Indian Mobile</span>
              </label>

              <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:bg-white focus-within:border-amber-500 transition-all">
                <div className="px-3 py-2.5 bg-amber-50/80 border-r border-gray-200 text-xs font-black text-amber-900 flex items-center gap-1.5 select-none shrink-0">
                  <span className="text-sm">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  placeholder="98765 43210"
                  className="w-full text-sm bg-transparent px-3 py-2.5 text-gray-900 focus:outline-none font-semibold tracking-wider"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
                {phone.length === 10 && isValidIndianMobile(phone) && (
                  <span className="pr-3 text-emerald-600 text-xs font-black shrink-0">✓</span>
                )}
              </div>

              {phone.length > 0 && !isValidIndianMobile(phone) && (
                <p className="text-[11px] text-amber-800 mt-1 font-semibold flex items-center gap-1">
                  <span>⚠</span>
                  {phone.length < 10
                    ? `Enter ${10 - phone.length} more digit${10 - phone.length === 1 ? '' : 's'} (10 digits required)`
                    : 'Indian mobile numbers must start with 6, 7, 8, or 9'}
                </p>
              )}
            </div>

            {/* Order Date & Time Selection (Default: Today) */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Order Date *</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Default: Today
                  </span>
                </label>

                {/* Quick Date Chips */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDateType("today")}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all text-center ${
                      dateType === "today"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateType("tomorrow")}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all text-center ${
                      dateType === "tomorrow"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateType("custom")}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all text-center ${
                      dateType === "custom"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Pick Date 📅
                  </button>
                </div>

                {/* Custom Date Input if selected */}
                {dateType === "custom" && (
                  <div className="mt-2">
                    <input
                      type="date"
                      min={getTodayDateString()}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Order Time */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pickup / Delivery Time *</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {["ASAP (~30m)", "04:00 PM", "06:00 PM", "08:00 PM"].map((tSlot) => {
                    const isSelected = orderTime === tSlot;
                    return (
                      <button
                        key={tSlot}
                        type="button"
                        onClick={() => setOrderTime(tSlot)}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? "bg-amber-100 text-amber-900 border-amber-400 font-black"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {tSlot}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  placeholder="Or custom time (e.g. 5:30 PM)"
                  value={orderTime}
                  onChange={(e) => setOrderTime(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Cake Inscription / Message */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Cake Inscription / Special Message (Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please write 'Happy 21st Birthday Sneha' in chocolate ganache, and add 2 candles..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
              />
            </div>
          </div>

          {/* Confirm & Place Order CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPlacing}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-base shadow-xl shadow-amber-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-200" />
              <span>
                {isPlacing ? "Sending to Bakery Kitchen..." : `Confirm & Place Order • ₹${cartTotal} 🍰`}
              </span>
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              Payment is collected at the bakery counter upon delivery or pickup.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};
