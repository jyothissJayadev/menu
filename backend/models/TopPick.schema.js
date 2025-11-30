import mongoose from "mongoose";
const TopPickSchema = new mongoose.Schema(
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
    included: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("TopPick", TopPickSchema);
