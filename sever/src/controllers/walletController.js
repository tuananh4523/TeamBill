import ViTien from "../models/walletModel.js";
import GiaoDich from "../models/transactionModel.js";
import { giaoDichSchema, walletSchema } from "../schema/walletSchema.js";

const napasMap = { MB: "970422", VCB: "970436", TCB: "970407" };
const VIETQR_IMAGE = "https://img.vietqr.io/image/MB-3666904052003-qr_only.png";

// ===================== TẠO VÍ MẶC ĐỊNH =====================
export const taoViMacDinh = async (userId) => {
  let vi = await ViTien.findOne({ userId });
  if (!vi) {
    vi = await ViTien.create({
      userId,
      soDu: 0,
      maThamChieu: "REF" + Date.now(),
      thongTinNganHang: {
        chuTaiKhoan: "NGUYEN VAN TUAN ANH",
        soTaiKhoan: "3666904052003",
        maNganHang: "MB",
        maNapas: napasMap["MB"],
      },
    });
  }
  return vi;
};

// ===================== TẠO VÍ =====================
export const createWallet = async (req, res) => {
  try {
    const { error } = walletSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({ success: false, message: error.details.map(m => m.message) });

    const { userId, chuTaiKhoan, soTaiKhoan, maNganHang } = req.body;
    const existed = await ViTien.findOne({ userId });
    if (existed)
      return res.status(400).json({ success: false, message: "Người dùng đã có ví" });

    const vi = await ViTien.create({
      userId,
      soDu: 0,
      maThamChieu: "REF" + Date.now(),
      thongTinNganHang: {
        chuTaiKhoan,
        soTaiKhoan,
        maNganHang,
        maNapas: napasMap[maNganHang] || "970422",
      },
    });

    res.json({ success: true, message: "Tạo ví thành công", vi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== LẤY THÔNG TIN VÍ =====================
export const getWalletInfo = async (req, res) => {
  try {
    const { userId } = req.query;
    const vi = await taoViMacDinh(userId);
    res.json({
      success: true,
      balance: vi.soDu,
      refCode: vi.maThamChieu,
      bankInfo: vi.thongTinNganHang,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== DANH SÁCH GIAO DỊCH =====================
export const getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    const vi = await ViTien.findOne({ userId });
    if (!vi) return res.status(404).json({ message: "Không tìm thấy ví" });

    const ds = await GiaoDich.find({ walletId: vi._id }).sort({ createdAt: -1 });
    res.json({ success: true, transactions: ds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== GIAO DỊCH CHUNG =====================
export const createTransaction = async (req, res) => {
  try {
    const { error } = giaoDichSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({ message: error.details.map(d => d.message) });

    const { userId, loai, soTien, moTa } = req.body;
    const vi = await taoViMacDinh(userId);
    const huong = loai === "NAP" ? "CONG" : "TRU";

    if (huong === "TRU" && vi.soDu < soTien)
      return res.status(400).json({ message: "Số dư không đủ" });

    const gd = await GiaoDich.create({
      walletId: vi._id,
      code: "GD" + Date.now(),
      type: loai,
      direction: huong,
      amount: soTien,
      description: moTa || "",
      status: "THANHCONG",
    });

    vi.soDu += huong === "CONG" ? soTien : -soTien;
    await vi.save();

    res.status(201).json({ message: "Giao dịch thành công", transaction: gd, newBalance: vi.soDu });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== QR MB BANK (CỐ ĐỊNH) =====================
export const taoQRVietQR = async (req, res) => {
  try {
    const { userId } = req.body;
    const vi = await taoViMacDinh(userId);
    res.json({
      success: true,
      message: "QR cố định cho nạp tiền vào ví Team Bill",
      qrUrl: VIETQR_IMAGE,
      thongTinChuyenKhoan: {
        nganHang: "MB Bank",
        soTaiKhoan: "3666904052003",
        chuTaiKhoan: "NGUYEN VAN TUAN ANH",
        noiDung: `NAP_${vi.maThamChieu}`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== XÁC NHẬN NẠP TIỀN =====================
export const xacNhanNapTien = async (req, res) => {
  try {
    const { userId, soTien } = req.body;
    if (!userId || !soTien)
      return res.status(400).json({ success: false, message: "Thiếu userId hoặc số tiền" });

    const vi = await ViTien.findOne({ userId });
    if (!vi) return res.status(404).json({ success: false, message: "Không tìm thấy ví" });

    vi.soDu += Number(soTien);
    await vi.save();

    const gd = await GiaoDich.create({
      walletId: vi._id,
      code: "GD" + Date.now(),
      type: "NAP",
      direction: "CONG",
      amount: soTien,
      description: "Nạp tiền vào ví qua MB Bank",
      status: "THANHCONG",
    });

    res.status(201).json({ success: true, message: "Nạp tiền thành công", transaction: gd, newBalance: vi.soDu });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== RÚT TIỀN =====================
export const rutTien = async (req, res) => {
  try {
    const { userId, soTien, nganHang, soTaiKhoan, chuTaiKhoan } = req.body;
    if (!userId || !soTien)
      return res.status(400).json({ success: false, message: "Thiếu thông tin" });

    const vi = await ViTien.findOne({ userId });
    if (!vi) return res.status(404).json({ success: false, message: "Không tìm thấy ví" });
    if (vi.soDu < soTien)
      return res.status(400).json({ success: false, message: "Số dư không đủ để rút" });

    vi.soDu -= Number(soTien);
    await vi.save();

    const gd = await GiaoDich.create({
      walletId: vi._id,
      code: "GD" + Date.now(),
      type: "RUT",
      direction: "TRU",
      amount: soTien,
      description: `Rút ${soTien.toLocaleString()}đ về ${nganHang} (${soTaiKhoan}) - ${chuTaiKhoan}`,
      status: "THANHCONG",
    });

    res.status(201).json({ success: true, message: "Rút tiền thành công", transaction: gd, newBalance: vi.soDu });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
