import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    soDu: { type: Number, default: 0, min: 0 },
    maThamChieu: { type: String, required: true, unique: true },
    thongTinNganHang: {
      chuTaiKhoan: { type: String, required: true },
      soTaiKhoan: { type: String, required: true },
      maNganHang: { type: String, required: true },
      maNapas: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("ViTien", walletSchema);
