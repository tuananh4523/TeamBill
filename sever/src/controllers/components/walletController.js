// controllers/walletController.js
import ViTien from "../models/walletModel.js";
import GiaoDich from "../models/transactionModel.js";
import { walletSchema, giaoDichSchema } from "../schema/walletSchema.js";

const napasMap = { MB: "970422", VCB: "970436", TCB: "970407" };

// Helper: flatten banking fields theo form
const flattenBank = (vi) => ({
  thongTinNganHang_chuTaiKhoan: vi.thongTinNganHang?.chuTaiKhoan || "",
  thongTinNganHang_soTaiKhoan:  vi.thongTinNganHang?.soTaiKhoan  || "",
  thongTinNganHang_maNganHang:  vi.thongTinNganHang?.maNganHang  || "",
  thongTinNganHang_maNapas:     vi.thongTinNganHang?.maNapas     || "",
  thongTinNganHang_tenNganHang: vi.thongTinNganHang?.tenNganHang || "",
});

// ===================== Tạo ví mới =====================
export const createWallet = async (req, res) => {
  try {
    const { error } = walletSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: error.details.map((m) => m.message) });

    const {
      userId, tenVi, loaiVi, chuTaiKhoan, soTaiKhoan, maNganHang, maNapas, tenNganHang,
      gioiHanRut, gioiHanNap, maPIN, isLinkedBank
    } = req.body;

    const exist = await ViTien.findOne({ userId });
    if (exist) return res.status(400).json({ message: "Người dùng đã có ví" });

    const vi = await ViTien.create({
      userId,
      maThamChieu: "REF" + Date.now(),
      tenVi,
      loaiVi,
      gioiHanRut,
      gioiHanNap,
      maPIN,
      isLinkedBank: typeof isLinkedBank === "boolean" ? isLinkedBank : true,
      thongTinNganHang: { chuTaiKhoan, soTaiKhoan, maNganHang, maNapas, tenNganHang },
      ngayKichHoat: new Date(),
    });

    res.status(201).json({ message: "Tạo ví thành công", vi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== Lấy thông tin ví =====================
export const getWalletInfo = async (req, res) => {
  try {
    const { userId } = req.query;
    const vi = await ViTien.findOne({ userId });
    if (!vi) return res.status(404).json({ message: "Không tìm thấy ví" });

    res.json({
      _id: vi._id,
      userId: vi.userId,
      maThamChieu: vi.maThamChieu,
      tenVi: vi.tenVi,
      loaiVi: vi.loaiVi,
      soDu: vi.soDu,
      tongNap: vi.tongNap,
      tongRut: vi.tongRut,
      gioiHanRut: vi.gioiHanRut,
      gioiHanNap: vi.gioiHanNap,
      trangThai: vi.trangThai,
      maPIN: vi.maPIN || "",
      isLinkedBank: vi.isLinkedBank,
      ngayKichHoat: vi.ngayKichHoat,
      lanCapNhatCuoi: vi.lanCapNhatCuoi,
      createdAt: vi.createdAt,
      updatedAt: vi.updatedAt,
      ...flattenBank(vi),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== Lấy giao dịch (lọc + phân trang) =====================
export const getTransactions = async (req, res) => {
  try {
    const { userId, walletId, type, status, category, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    const vi = walletId
      ? await ViTien.findById(walletId)
      : await ViTien.findOne({ userId });

    if (!vi) return res.status(404).json({ message: "Không tìm thấy ví" });

    const q = { walletId: vi._id };
    if (type)     q.type = type;
    if (status)   q.status = status;
    if (category) q.category = category;
    if (dateFrom || dateTo) {
      q.date = {};
      if (dateFrom) q.date.$gte = new Date(dateFrom);
      if (dateTo)   q.date.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      GiaoDich.find(q).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      GiaoDich.countDocuments(q),
    ]);

    res.json({
      data: items,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== Nạp tiền =====================
export const napTien = async (req, res) => {
  try {
    const { error } = giaoDichSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: error.details.map((m) => m.message) });

    const { userId, soTien, moTa = "Nạp tiền vào ví", fee = 0, deviceInfo = "", category = "TOPUP" } = req.body;
    const vi = await ViTien.findOne({ userId });
    if (!vi) return res.status(404).json({ message: "Không tìm thấy ví" });

    const balanceBefore = vi.soDu;
    const balanceAfter  = balanceBefore + Number(soTien) - Number(fee);

    vi.soDu = balanceAfter;
    vi.tongNap += Number(soTien);
    vi.lanCapNhatCuoi = new Date();
    await vi.save();

    const gd = await GiaoDich.create({
      walletId: vi._id,
      userId,
      code: "GD" + Date.now(),
      refCode: "BANK" + Math.floor(Math.random() * 1e9),
      type: "NAP",
      direction: "CONG",
      category,
      amount: soTien,
      fee,
      balanceBefore,
      balanceAfter,
      description: moTa,
      status: "THANHCONG",
      deviceInfo,
      date: new Date(),
      confirmedAt: new Date(),
    });

    res.status(201).json({ message: "Nạp tiền thành công", balance: vi.soDu, transaction: gd });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== Rút tiền =====================
export const rutTien = async (req, res) => {
  try {
    const { error } = giaoDichSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: error.details.map((m) => m.message) });

    const { userId, soTien, moTa = "Rút tiền khỏi ví", fee = 0, deviceInfo = "", category = "WITHDRAW" } = req.body;
    const vi = await ViTien.findOne({ userId });
    if (!vi) return res.status(404).json({ message: "Không tìm thấy ví" });

    const totalDebit = Number(soTien) + Number(fee);
    if (vi.soDu < totalDebit) return res.status(400).json({ message: "Số dư không đủ để rút" });

    const balanceBefore = vi.soDu;
    const balanceAfter  = balanceBefore - totalDebit;

    vi.soDu = balanceAfter;
    vi.tongRut += Number(soTien);
    vi.lanCapNhatCuoi = new Date();
    await vi.save();

    const gd = await GiaoDich.create({
      walletId: vi._id,
      userId,
      code: "GD" + Date.now(),
      refCode: "BANK" + Math.floor(Math.random() * 1e9),
      type: "RUT",
      direction: "TRU",
      category,
      amount: soTien,
      fee,
      balanceBefore,
      balanceAfter,
      description: moTa,
      status: "THANHCONG",
      deviceInfo,
      date: new Date(),
      confirmedAt: new Date(),
    });

    res.status(201).json({ message: "Rút tiền thành công", balance: vi.soDu, transaction: gd });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== Tạo QR VietQR (mock) =====================
export const taoQRVietQR = async (req, res) => {
  try {
    const { userId, amount = 0, description = "" } = req.body;
    const vi = await ViTien.findOne({ userId });
    if (!vi) return res.status(404).json({ message: "Không tìm thấy ví" });

    const bank = vi.thongTinNganHang;
    const napas = bank.maNapas || napasMap[bank.maNganHang] || "970422";

    // Link QR kiểu VietQR (mock demo): đổi sang service bạn dùng thực tế nếu cần
    const url = `https://img.vietqr.io/image/${napas}-${bank.soTaiKhoan}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(bank.chuTaiKhoan)}`;

    res.json({
      maThamChieu: vi.maThamChieu,
      qr: { image: url, amount, description },
      ...flattenBank(vi),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
