import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  status: { type: String, enum: ["CHỜ", "HOÀN TẤT"], default: "CHỜ" },
  person: { type: String, required: true }, // ai chi trả
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
