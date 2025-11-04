import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import { walletSchema, transactionSchema } from "../schema/walletSchema.js";

const napasMap = { MB: "970422", VCB: "970436", TCB: "970407" };

/* Helper: lấy thông tin ngân hàng phẳng */
const flattenBank = (wallet) => ({
  bankAccount_holderName: wallet.bankAccount?.holderName || "",
  bankAccount_number: wallet.bankAccount?.number || "",
  bankAccount_bankCode: wallet.bankAccount?.bankCode || "",
  bankAccount_napasCode: wallet.bankAccount?.napasCode || "",
  bankAccount_bankName: wallet.bankAccount?.bankName || "",
});

/* ===================== TẠO VÍ MỚI ===================== */
export const createWallet = async (req, res) => {
  try {
    const { error } = walletSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res
        .status(400)
        .json({ message: error.details.map((m) => m.message) });

    const {
      userId,
      walletName,
      walletType,
      bankAccount_holderName,
      bankAccount_number,
      bankAccount_bankCode,
      bankAccount_napasCode,
      bankAccount_bankName,
      withdrawLimit,
      depositLimit,
      pinCode,
      isLinkedBank,
    } = req.body;

    const exist = await Wallet.findOne({ userId });
    if (exist)
      return res.status(400).json({ message: "Người dùng đã có ví" });

    const wallet = await Wallet.create({
      userId,
      refCode: "REF" + Date.now(),
      walletName,
      walletType,
      balance: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      withdrawLimit,
      depositLimit,
      pinCode,
      isLinkedBank: typeof isLinkedBank === "boolean" ? isLinkedBank : true,
      bankAccount: {
        holderName: bankAccount_holderName,
        number: bankAccount_number,
        bankCode: bankAccount_bankCode,
        napasCode: bankAccount_napasCode,
        bankName: bankAccount_bankName,
      },
      status: "ACTIVE",
      activatedAt: new Date(),
      lastUpdated: new Date(),
    });

    res.status(201).json({ message: "Tạo ví thành công", wallet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== LẤY THÔNG TIN VÍ ===================== */
export const getWalletInfo = async (req, res) => {
  try {
    const { userId } = req.query;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet)
      return res.status(404).json({ message: "Không tìm thấy ví" });

    res.json({
      _id: wallet._id,
      userId: wallet.userId,
      refCode: wallet.refCode,
      walletName: wallet.walletName,
      walletType: wallet.walletType,
      balance: wallet.balance,
      totalDeposit: wallet.totalDeposit,
      totalWithdraw: wallet.totalWithdraw,
      withdrawLimit: wallet.withdrawLimit,
      depositLimit: wallet.depositLimit,
      status: wallet.status,
      pinCode: wallet.pinCode || "",
      isLinkedBank: wallet.isLinkedBank,
      activatedAt: wallet.activatedAt,
      lastUpdated: wallet.lastUpdated,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      ...flattenBank(wallet),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== LẤY GIAO DỊCH ===================== */
export const getTransactions = async (req, res) => {
  try {
    const {
      userId,
      walletId,
      type,
      status,
      category,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    const wallet = walletId
      ? await Wallet.findById(walletId)
      : await Wallet.findOne({ userId });

    if (!wallet)
      return res.status(404).json({ message: "Không tìm thấy ví" });

    const q = { walletId: wallet._id };
    if (type) q.type = type;
    if (status) q.status = status;
    if (category) q.category = category;
    if (dateFrom || dateTo) {
      q.date = {};
      if (dateFrom) q.date.$gte = new Date(dateFrom);
      if (dateTo) q.date.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Transaction.find(q).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(q),
    ]);

    res.json({
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== NẠP TIỀN ===================== */
export const deposit = async (req, res) => {
  try {
    const { error } = transactionSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res
        .status(400)
        .json({ message: error.details.map((m) => m.message) });

    const { userId, amount, description = "Nạp tiền vào ví", fee = 0 } =
      req.body;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet)
      return res.status(404).json({ message: "Không tìm thấy ví" });

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + Number(amount) - Number(fee);

    wallet.balance = balanceAfter;
    wallet.totalDeposit += Number(amount);
    wallet.lastUpdated = new Date();
    await wallet.save();

    const tx = await Transaction.create({
      walletId: wallet._id,
      userId,
      code: "TX" + Date.now(),
      refCode: "BANK" + Math.floor(Math.random() * 1e9),
      type: "DEPOSIT",
      direction: "IN",
      category: "TOPUP",
      amount,
      fee,
      balanceBefore,
      balanceAfter,
      description,
      status: "SUCCESS",
      date: new Date(),
      confirmedAt: new Date(),
    });

    res.status(201).json({
      message: "Nạp tiền thành công",
      balance: wallet.balance,
      transaction: tx,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== RÚT TIỀN ===================== */
export const withdraw = async (req, res) => {
  try {
    const { error } = transactionSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res
        .status(400)
        .json({ message: error.details.map((m) => m.message) });

    const { userId, amount, description = "Rút tiền khỏi ví", fee = 0 } =
      req.body;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet)
      return res.status(404).json({ message: "Không tìm thấy ví" });

    const totalDebit = Number(amount) + Number(fee);
    if (wallet.balance < totalDebit)
      return res.status(400).json({ message: "Số dư không đủ để rút" });

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - totalDebit;

    wallet.balance = balanceAfter;
    wallet.totalWithdraw += Number(amount);
    wallet.lastUpdated = new Date();
    await wallet.save();

    const tx = await Transaction.create({
      walletId: wallet._id,
      userId,
      code: "TX" + Date.now(),
      refCode: "BANK" + Math.floor(Math.random() * 1e9),
      type: "WITHDRAW",
      direction: "OUT",
      category: "WITHDRAW",
      amount,
      fee,
      balanceBefore,
      balanceAfter,
      description,
      status: "SUCCESS",
      date: new Date(),
      confirmedAt: new Date(),
    });

    res.status(201).json({
      message: "Rút tiền thành công",
      balance: wallet.balance,
      transaction: tx,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== TẠO QR VIETQR (MOCK) ===================== */
export const createVietQR = async (req, res) => {
  try {
    const { userId, amount = 0, description = "" } = req.body;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet)
      return res.status(404).json({ message: "Không tìm thấy ví" });

    const bank = wallet.bankAccount;
    const napas =
      bank.napasCode || napasMap[bank.bankCode] || "970422";

    const url = `https://img.vietqr.io/image/${napas}-${bank.number}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(
      description
    )}&accountName=${encodeURIComponent(bank.holderName)}`;

    res.json({
      refCode: wallet.refCode,
      qr: { image: url, amount, description },
      ...flattenBank(wallet),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
