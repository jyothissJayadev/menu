// webMenu/src/OrderTrackingModal.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, ChefHat, Sparkles, X, Phone, MapPin } from "lucide-react";
import { fetchOrderStatus } from "./api";

export const OrderTrackingModal = ({ order: initialOrder, isOpen, onClose, companyId }) => {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Real-time polling: check order status every 2.5s from the backend
  useEffect(() => {
    if (!isOpen || !order || !order._id || !companyId) return;

    const interval = setInterval(async () => {
      try {
        const updated = await fetchOrderStatus(companyId, order._id);
        if (updated) {
          setOrder(updated);
        }
      } catch (_) {}
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, order?._id, companyId]);

  if (!isOpen || !order) return null;

  const currentStatus = order.status || "pending";

  const steps = [
    { key: "pending", label: "Order Received", sub: "Sent to bakery kitchen", icon: Clock },
    { key: "cooking", label: "Baking in Oven", sub: "Chefs preparing your cake", icon: ChefHat },
    { key: "completed", label: "Baked & Ready", sub: "Ready at the counter", icon: Sparkles },
    { key: "delivered", label: "Delivered", sub: "Enjoy your treat!", icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    if (status === "pending") return 0;
    if (status === "cooking" || status === "preparing") return 1;
    if (status === "completed" || status === "served") return 2;
    if (status === "delivered") return 3;
    return 0;
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Live Order Status
          </div>
          <h2 className="text-2xl font-black">{order.orderNo || "ORD-101"}</h2>
          <p className="text-xs text-amber-100 mt-1">
            {order.table || "Takeaway"} • Placed at {new Date(order.startTime || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Live Stepper Tracker */}
        <div className="p-6 border-b border-gray-100 bg-amber-50/40">
          <div className="relative">
            {steps.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const IconComp = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-4 mb-5 last:mb-0 relative">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-8 -ml-px ${
                        idx < activeIndex ? "bg-amber-600" : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      isCurrent
                        ? "bg-amber-600 text-white ring-4 ring-amber-100 animate-pulse"
                        : isPast
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  {/* Label & Details */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-bold ${
                          isCurrent
                            ? "text-amber-800 font-extrabold"
                            : isPast
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & Inscription */}
        <div className="p-6 max-h-64 overflow-y-auto">
          {order.notes && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                Custom Cake Request / Inscription:
              </p>
              <p className="text-xs text-gray-800 italic">"{order.notes}"</p>
            </div>
          )}

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Ordered Items ({order.items?.length || 0})
          </h3>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
                    {item.qty}x
                  </span>
                  <span className="text-gray-800 font-medium text-xs">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 text-xs">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700">Total Paid:</span>
            <span className="text-lg font-black text-amber-700">₹{order.total}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
