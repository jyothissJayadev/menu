// utils/orderNumber.js
import Counter from "../models/Counter.schema.js";

/**
 * generateOrderNo('orders') => "20251126-0001"
 */
export async function generateOrderNo(prefix = "orders") {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const key = `${prefix}_${day}`;
  const updated = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const seq = String(updated.seq).padStart(4, "0");
  return `${day}-${seq}`;
}
