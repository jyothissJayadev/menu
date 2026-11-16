import mongoose from "mongoose";

const OrderItemSubSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: { type: String, required: true },
    variant: { type: String, default: "" }, // e.g. "0.5 kg", "1 kg", "2 kg"
    qty: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    addons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Addon" }],
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    orderNo: { type: String, required: true, index: true }, // ORD-101
    orderNumber: { type: Number, index: true },             // 101
    items: { type: [OrderItemSubSchema], default: [] },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    date: { type: String, default: "Today" }, // e.g. "Today" or "2026-11-16"
    time: { type: String, default: "ASAP" },  // e.g. "ASAP", "05:00 PM"
    table: { type: String, default: "Takeaway" },
    status: {
      type: String,
      enum: ["pending", "preparing", "cooking", "served", "completed", "delivered", "cancelled"],
      default: "pending",
    },
    name: { type: String }, // customer name
    phone: { type: String }, // customer phone
    notes: { type: String, default: "" }, // custom message / cake inscription
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
