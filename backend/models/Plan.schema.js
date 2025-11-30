import mongoose from "mongoose";
const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    durationDays: { type: Number, required: true }, // duration in days
    planId: { type: String, required: true, unique: true }, // external plan identifier
    amount: { type: Number, required: true },
    features: {
      menu: { type: Boolean, default: true },
      orders: { type: Boolean, default: true },
      // extendable toggles (analytics, support, etc.)
    },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", PlanSchema);
