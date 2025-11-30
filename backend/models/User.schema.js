import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // hashed password
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    role: {
      type: String,
      enum: ["owner", "manager", "staff", "customer"],
      default: "customer",
    },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
