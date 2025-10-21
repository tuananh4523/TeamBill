import mongoose from "mongoose";
import ViTien from "./models/walletModel.js";
import GiaoDich from "./models/transactionModel.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/teamBill";

const seedData = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Kết nối MongoDB thành công");

  // Xóa dữ liệu cũ
  await ViTien.deleteMany({});
  await GiaoDich.deleteMany({});

  // Tạo user giả
  const userId = new mongoose.Types.ObjectId("67027f88c5b3b820489adfe1");

  // Tạo ví Team Bill
  const vi = await ViTien.create({
    userId,
    soDu: 0,
    maThamChieu: "REF" + Date.now(),
    thongTinNganHang: {
      chuTaiKhoan: "NGUYEN VAN TUAN ANH",
      soTaiKhoan: "3666904052003",
      maNganHang: "MB",
      maNapas: "970422",
    },
  });

  console.log("💳 Ví đã tạo:", vi.maThamChieu);

  // Fake các giao dịch
  const giaoDichs = [
    {
      walletId: vi._id,
      code: "GD" + Date.now(),
      type: "NAP",
      direction: "CONG",
      amount: 200000,
      description: "Nạp tiền lần 1",
      status: "THANHCONG",
    },
    {
      walletId: vi._id,
      code: "GD" + (Date.now() + 1),
      type: "NAP",
      direction: "CONG",
      amount: 300000,
      description: "Nạp tiền lần 2",
      status: "THANHCONG",
    },
    {
      walletId: vi._id,
      code: "GD" + (Date.now() + 2),
      type: "NAP",
      direction: "CONG",
      amount: 500000,
      description: "Nạp tiền lần 3",
      status: "THANHCONG",
    },
    {
      walletId: vi._id,
      code: "GD" + (Date.now() + 3),
      type: "RUT",
      direction: "TRU",
      amount: 150000,
      description: "Rút tiền về MB Bank",
      status: "THANHCONG",
    },
    {
      walletId: vi._id,
      code: "GD" + (Date.now() + 4),
      type: "RUT",
      direction: "TRU",
      amount: 100000,
      description: "Rút tiền về Vietcombank",
      status: "THANHCONG",
    },
  ];

  await GiaoDich.insertMany(giaoDichs);

  // Tính tổng số dư còn lại
  const tongNap = giaoDichs
    .filter((g) => g.direction === "CONG")
    .reduce((a, b) => a + b.amount, 0);
  const tongRut = giaoDichs
    .filter((g) => g.direction === "TRU")
    .reduce((a, b) => a + b.amount, 0);

  vi.soDu = tongNap - tongRut;
  await vi.save();

  console.log(`Tạo thành công ${giaoDichs.length} giao dịch.`);
  console.log(`Số dư hiện tại: ${vi.soDu.toLocaleString()} VND`);
  console.log(" Seed dữ liệu ví hoàn tất.");

  await mongoose.disconnect();
};

seedData().catch((err) => console.error("❌ Lỗi seed:", err));
