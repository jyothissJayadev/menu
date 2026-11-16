// webMenu/src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  User,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  Zap,
  CalendarDays,
  Sun,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api";
import { ScrollTimePicker } from "../components/ScrollTimePicker";

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

const getTomorrowDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const CheckoutPage = () => {
  const { cart, cartTotal, cartCount, clearCart, company, customerDetails, setCustomerDetails } =
    useCart();
  const navigate = useNavigate();

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  const [name, setName] = useState(customerDetails.name || "");
  const [phone, setPhone] = useState(() => extract10Digits(customerDetails.phone || ""));
  const [dateType, setDateType] = useState("today"); // "today" | "tomorrow" | "custom"
  const [customDate, setCustomDate] = useState(todayStr);

  // Time handling:
  // When date is "today", user can choose ASAP or custom scheduled time
  // When date is NOT "today", ASAP is completely hidden / not available
  const [timeMode, setTimeMode] = useState("asap"); // "asap" | "custom"
  const [wheelTime, setWheelTime] = useState("04:00 PM");

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

  // Safe handler to prevent selecting previous dates
  const handleCustomDateChange = (val) => {
    if (!val) return;
    if (val < todayStr) {
      alert("Past dates cannot be selected. Please pick today or a future date.");
      setCustomDate(todayStr);
      return;
    }
    setCustomDate(val);
  };

  const isToday = dateType === "today";
  const effectiveTime = isToday && timeMode === "asap" ? "ASAP (~30m)" : wheelTime;

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

    // Guard against previous dates
    if (dateType === "custom" && customDate < todayStr) {
      alert("Previous dates cannot be selected. Please pick today or a future date.");
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
          : formatDisplayDate(customDate);

      const resolvedTime =
        isToday && timeMode === "asap"
          ? "ASAP (~30m)"
          : wheelTime;

      const payload = {
        name: name.trim(),
        phone: `+91 ${phone.trim()}`,
        date: resolvedDate,
        time: resolvedTime,
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

  const getResolvedDateLabel = () => {
    if (dateType === "today") return `Today (${formatDisplayDate(todayStr)})`;
    if (dateType === "tomorrow") return `Tomorrow (${formatDisplayDate(tomorrowStr)})`;
    return formatDisplayDate(customDate);
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

            {/* Order Date & Time Selection (Premium Experience) */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              {/* Date Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Select Order Date *</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {getResolvedDateLabel()}
                  </span>
                </div>

                {/* 3 Premium Date Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {/* Today Card */}
                  <button
                    type="button"
                    onClick={() => setDateType("today")}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      dateType === "today"
                        ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20"
                        : "bg-white hover:bg-amber-50/50 text-gray-800 border-gray-200 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">Today</span>
                      <Zap className={`w-3.5 h-3.5 ${dateType === "today" ? "text-amber-200" : "text-amber-600"}`} />
                    </div>
                    <p className={`text-[11px] mt-1 font-semibold ${dateType === "today" ? "text-amber-100" : "text-gray-500"}`}>
                      {formatDisplayDate(todayStr)}
                    </p>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-2 inline-block w-fit ${
                      dateType === "today" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      ASAP Available
                    </span>
                  </button>

                  {/* Tomorrow Card */}
                  <button
                    type="button"
                    onClick={() => setDateType("tomorrow")}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      dateType === "tomorrow"
                        ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20"
                        : "bg-white hover:bg-amber-50/50 text-gray-800 border-gray-200 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">Tomorrow</span>
                      <Sun className={`w-3.5 h-3.5 ${dateType === "tomorrow" ? "text-amber-200" : "text-amber-600"}`} />
                    </div>
                    <p className={`text-[11px] mt-1 font-semibold ${dateType === "tomorrow" ? "text-amber-100" : "text-gray-500"}`}>
                      {formatDisplayDate(tomorrowStr)}
                    </p>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-2 inline-block w-fit ${
                      dateType === "tomorrow" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      Scheduled Bake
                    </span>
                  </button>

                  {/* Custom Pick Date Card */}
                  <button
                    type="button"
                    onClick={() => setDateType("custom")}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      dateType === "custom"
                        ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20"
                        : "bg-white hover:bg-amber-50/50 text-gray-800 border-gray-200 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">Pick Date</span>
                      <CalendarDays className={`w-3.5 h-3.5 ${dateType === "custom" ? "text-amber-200" : "text-amber-600"}`} />
                    </div>
                    <p className={`text-[11px] mt-1 font-semibold line-clamp-1 ${dateType === "custom" ? "text-amber-100" : "text-gray-500"}`}>
                      {dateType === "custom" && customDate ? formatDisplayDate(customDate) : "Calendar"}
                    </p>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-2 inline-block w-fit ${
                      dateType === "custom" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      Advance Order
                    </span>
                  </button>
                </div>

                {/* Calendar Input when Pick Date is selected */}
                {dateType === "custom" && (
                  <div className="mt-2.5 p-3 bg-white rounded-2xl border border-amber-200 shadow-sm animate-in fade-in duration-150">
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Choose Future Date (Past dates are strictly disabled):
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={customDate}
                      onChange={(e) => handleCustomDateChange(e.target.value)}
                      className="w-full text-xs bg-amber-50/40 border border-amber-200 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-amber-800 font-medium mt-1.5 flex items-center gap-1">
                      <span>✓</span>
                      <span>Selected Date: <strong>{formatDisplayDate(customDate)}</strong></span>
                    </p>
                  </div>
                )}
              </div>

              {/* Pickup / Delivery Time Section */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pickup / Delivery Time *</span>
                  </label>
                  <span className="text-[11px] font-black text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {effectiveTime}
                  </span>
                </div>

                {/* Conditional Time Picker based on Date */}
                {isToday ? (
                  /* Date is TODAY: Customer can choose ASAP (~30m) OR Scroll Alarm Clock */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTimeMode("asap")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                          timeMode === "asap"
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>ASAP (~30m)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTimeMode("custom")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                          timeMode === "custom"
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Set Exact Time</span>
                      </button>
                    </div>

                    {timeMode === "asap" ? (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-900">
                        <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="font-medium">
                          <strong>Fastest Preparation:</strong> Our bakery will prepare, box, and have your fresh cake ready in ~30 minutes today!
                        </p>
                      </div>
                    ) : (
                      <ScrollTimePicker
                        value={wheelTime}
                        onChange={setWheelTime}
                      />
                    )}
                  </div>
                ) : (
                  /* Date is Tomorrow or Future: DO NOT PROVIDE ASAP (Strictly scroll wheel time) */
                  <div className="space-y-2">
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-900">
                      <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <p className="font-semibold">
                        Scheduled for <strong>{getResolvedDateLabel()}</strong>. Scroll the clock wheel below to set exact time:
                      </p>
                    </div>

                    {/* Scrollable Alarm-Setter Time Picker */}
                    <ScrollTimePicker
                      value={wheelTime}
                      onChange={setWheelTime}
                    />
                  </div>
                )}
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
