import mongoose from "mongoose";

const AddonSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    categoryName: { type: String, default: "Addons" }, // e.g., "Toppings"
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    included: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Addon", AddonSchema);
