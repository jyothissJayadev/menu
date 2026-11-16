// webMenu/src/pages/OrderTrackingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, ChefHat, Sparkles, Phone, MapPin, ArrowLeft, RefreshCw } from "lucide-react";
import { fetchOrderStatus, fetchCompany } from "../api";
import { useCart } from "../context/CartContext";

export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { company: contextCompany } = useCart();
  const [companyId, setCompanyId] = useState(
    contextCompany ? contextCompany._id : "6af8890bb0d5cb3fd1c686bc"
  );
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // If companyId is not in context on page reload, fetch it from backend
  useEffect(() => {
    async function ensureCompany() {
      if (!contextCompany) {
        try {
          const comp = await fetchCompany();
          if (comp) setCompanyId(comp._id);
        } catch (_) {}
      }
    }
    ensureCompany();
  }, [contextCompany]);

  // Initial fetch and 2.5s polling loop (survives page reload)
  useEffect(() => {
    if (!orderId || !companyId) return;

    let isMounted = true;
    async function loadOrder() {
      try {
        const data = await fetchOrderStatus(companyId, orderId);
        if (data && isMounted) {
          setOrder(data);
          setError(null);
        } else if (!order && isMounted) {
          setError("Order not found");
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load order");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();

    const interval = setInterval(loadOrder, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, companyId]);

  const steps = [
    { key: "pending", label: "Order Received", sub: "Sent to Lavino bakery kitchen", icon: Clock },
    { key: "cooking", label: "Baking in Oven", sub: "Chefs baking your cake with love", icon: ChefHat },
    { key: "completed", label: "Baked & Ready", sub: "Decorated & ready for pickup", icon: Sparkles },
    { key: "delivered", label: "Delivered", sub: "Enjoy your treat!", icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    if (status === "pending") return 0;
    if (status === "cooking" || status === "preparing") return 1;
    if (status === "completed" || status === "served") return 2;
    if (status === "delivered") return 3;
    return 0;
  };

  const activeIndex = order ? getStepIndex(order.status) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-700">Connecting to Lavino Kitchen...</p>
        <p className="text-xs text-gray-400 mt-1">Retrieving order #{orderId}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-amber-100 shadow-sm">
          <p className="text-3xl mb-2">🍰</p>
          <h2 className="text-lg font-black text-gray-900">Order Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            We couldn't retrieve the order details. It may have expired or been removed.
          </p>
          <Link
            to="/"
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-xl inline-block"
          >
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 text-gray-900 pb-20">
      {/* Top Banner Header */}
      <header className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
              title="Return to Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="inline-block bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-0.5">
                Live Order Status
              </div>
              <h1 className="text-xl font-black">{order.orderNo || "ORD-101"}</h1>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-amber-200">
              {order.table || "Takeaway"}
            </span>
            <p className="text-[10px] text-amber-100">
              {new Date(order.startTime || Date.now()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Tracking Content */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Live Stepper Tracker Card */}
        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-black text-base text-gray-900">Bakery Progress</h2>
              <p className="text-xs text-gray-400">Updates live from the cake kitchen</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="relative pl-2">
            {steps.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const IconComp = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0 relative">
                  {/* Connecting Vertical Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-10 -ml-px ${
                        idx < activeIndex ? "bg-amber-600" : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      isCurrent
                        ? "bg-amber-600 text-white ring-4 ring-amber-100 scale-110 shadow-md"
                        : isPast
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  {/* Label */}
                  <div className="pt-0.5">
                    <p
                      className={`font-black text-sm ${
                        isCurrent
                          ? "text-amber-800 font-extrabold"
                          : isPast
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & Items Card */}
        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900">Order Items</h3>
            <span className="text-xs font-bold text-gray-400">
              {order.items?.length || 0} items
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items?.map((it, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-amber-800 mr-1">{it.qty}x</span>
                  <span className="font-bold text-gray-800">{it.name}</span>
                  {it.variant && (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-200">
                      {it.variant}
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-gray-900">₹{it.price * it.qty}</span>
              </div>
            ))}
          </div>

          {/* Special Inscription Notes if present */}
          {order.notes ? (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs text-amber-900">
              <span className="font-bold">Inscription / Notes: </span>
              <span>{order.notes}</span>
            </div>
          ) : null}

          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-base font-black text-gray-900">
            <span>Total Bill</span>
            <span className="text-amber-700 text-lg">₹{order.total}</span>
          </div>
        </div>

        {/* Store & Customer Info Card */}
        <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm text-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span>Customer Name</span>
            <span className="font-bold text-gray-900">{order.name}</span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Contact Phone</span>
            <span className="font-bold text-gray-900">{order.phone}</span>
          </div>
          {(order.date || order.time) && (
            <div className="flex items-center justify-between text-gray-500">
              <span>Pickup Date & Time</span>
              <span className="font-bold text-amber-900">
                {order.date || "Today"} • {order.time || "ASAP"}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-gray-500">
            <span>Bakery Location</span>
            <span className="font-bold text-amber-800">Lavino Cake Studio, Cherupuzha</span>
          </div>
        </div>

        {/* Back to Menu Action */}
        <div className="pt-2">
          <Link
            to="/"
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Order More / Return to Menu 🍰</span>
          </Link>
        </div>
      </main>
    </div>
  );
};
