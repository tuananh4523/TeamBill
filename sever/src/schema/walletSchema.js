import Joi from "joi";

export const walletSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  chuTaiKhoan: Joi.string().trim().required(),
  soTaiKhoan: Joi.string().trim().required(),
  maNganHang: Joi.string().trim().required(),
  maNapas: Joi.string().trim().required(),
});

export const giaoDichSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  loai: Joi.string().valid("NAP", "RUT", "CHUYEN", "THANHTOAN").required(),
  soTien: Joi.number().positive().required(),
  moTa: Joi.string().allow("").optional(),
});
