import mongoose from "mongoose";
const OrderItemSubSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: { type: String, required: true },
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
    orderNo: { type: String, required: true, index: true }, // day-based order id (e.g., YYYYMMDD-0001)
    items: { type: [OrderItemSubSchema], default: [] },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    table: { type: String },
    status: {
      type: String,
      enum: ["pending", "preparing", "served", "completed", "cancelled"],
      default: "pending",
    },
    name: { type: String }, // customer name
    phone: { type: String }, // customer phone
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
