import mongoose from "mongoose";
const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String },
    logo: { type: String }, // URL to logo
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    planActive: { type: Boolean, default: false },
    settings: {
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
    },
  },
  { timestamps: true }
);

CompanySchema.index({ name: 1 });

export default mongoose.model("Company", CompanySchema);
