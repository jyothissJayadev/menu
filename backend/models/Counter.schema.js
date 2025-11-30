import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'orders_20251126'
  seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", CounterSchema);
