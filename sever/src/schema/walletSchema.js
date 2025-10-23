// schema/walletSchema.js
import Joi from "joi";

export const walletSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  tenVi:  Joi.string().max(100).default("Ví chính"),
  loaiVi: Joi.string().valid("CÁ NHÂN", "NHÓM").default("CÁ NHÂN"),

  // Banking
  chuTaiKhoan: Joi.string().trim().required(),
  soTaiKhoan:  Joi.string().trim().required(),
  maNganHang:  Joi.string().trim().required(),
  maNapas:     Joi.string().trim().required(),
  tenNganHang: Joi.string().trim().required(),

  // Limits
  gioiHanRut: Joi.number().positive().max(100000000).optional(),
  gioiHanNap: Joi.number().positive().max(200000000).optional(),

  // Optional flags
  maPIN:        Joi.string().min(4).max(12).optional(),
  isLinkedBank: Joi.boolean().optional(),
});

export const giaoDichSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  loai:   Joi.string().valid("NAP", "RUT", "CHUYEN", "THANHTOAN").required(),
  soTien: Joi.number().positive().required(),
  moTa:   Joi.string().allow("").optional(),
  fee:    Joi.number().min(0).default(0),
  deviceInfo: Joi.string().allow("").optional(),
  category:   Joi.string().allow("").optional(),
});
