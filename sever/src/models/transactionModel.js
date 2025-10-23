// models/walletModel.js
import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    maThamChieu:  { type: String, required: true, unique: true },
    tenVi:        { type: String, default: "Ví chính" },
    loaiVi:       { type: String, enum: ["CÁ NHÂN", "NHÓM"], default: "CÁ NHÂN" },

    soDu:     { type: Number, default: 0, min: 0 },
    tongNap:  { type: Number, default: 0 },
    tongRut:  { type: Number, default: 0 },

    gioiHanRut: { type: Number, default: 50_000_000 },
    gioiHanNap: { type: Number, default: 100_000_000 },

    thongTinNganHang: {
      chuTaiKhoan: { type: String, required: true },
      soTaiKhoan:  { type: String, required: true },
      maNganHang:  { type: String, required: true },
      maNapas:     { type: String, required: true },
      tenNganHang: { type: String, required: true },
    },

    trangThai: { type: String, enum: ["KÍCH_HOẠT", "KHÓA", "TẠM_DỪNG"], default: "KÍCH_HOẠT" },
    maPIN:     { type: String },
    isLinkedBank:   { type: Boolean, default: true },
    ngayKichHoat:   { type: Date, default: Date.now },
    lanCapNhatCuoi: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.ViTien || mongoose.model("ViTien", walletSchema);
