import mongoose from "mongoose";

const PaymentHistorySchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true }, // gateway or internal id
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    amount: { type: Number, required: true },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    gateway: { type: String }, // e.g., razorpay, stripe
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    rawResponse: { type: Object }, // store gateway response for reconciliation
  },
  { timestamps: true }
);

export default mongoose.model("PaymentHistory", PaymentHistorySchema);
