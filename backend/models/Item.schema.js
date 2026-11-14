import mongoose from "mongoose";

const TimingSubSchema = new mongoose.Schema(
  {
    start: { type: String }, // "HH:MM"
    end: { type: String }, // "HH:MM"
  },
  { _id: false }
);

const VariantSubSchema = new mongoose.Schema(
  {
    weight: { type: String, required: true, trim: true }, // e.g. "0.5 kg", "1 kg", "1.5 kg", "2 kg"
    price: { type: Number, required: true },
    offerPrice: { type: Number, default: null },
  },
  { _id: true }
);

const ItemSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    veg: { type: Boolean, default: true }, // true => veg, false => non-veg
    offer: { type: Boolean, default: false },
    offerPrice: { type: Number, default: null },
    variants: { type: [VariantSubSchema], default: [] }, // optional weight variants (0.5kg, 1kg, 1.5kg, 2kg, etc.)
    timing: { type: [TimingSubSchema], default: [] }, // item-level timing windows
    available: { type: Boolean, default: true }, // toggle on/off
  },
  { timestamps: true }
);

ItemSchema.index({ name: "text", description: "text" });

export default mongoose.model("Item", ItemSchema);
