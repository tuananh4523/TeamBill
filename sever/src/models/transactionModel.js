import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "ViTien", required: true },
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ["NAP", "RUT", "CHUYEN", "THANHTOAN"], required: true },
    direction: { type: String, enum: ["CONG", "TRU"], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    status: { type: String, enum: ["THANHCONG", "CHO", "THATBAI"], default: "THANHCONG" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("GiaoDich", transactionSchema);
