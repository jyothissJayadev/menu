import mongoose from "mongoose";
const TimingSubSchema = new mongoose.Schema(
  {
    start: { type: String }, // "HH:MM"
    end: { type: String }, // "HH:MM"
  },
  { _id: false }
);

const CategorySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    timing: { type: [TimingSubSchema], default: [] }, // empty => always available
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
