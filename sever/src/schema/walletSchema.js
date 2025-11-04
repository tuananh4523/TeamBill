import Joi from "joi";

/**
 * Schema kiểm tra dữ liệu khi tạo ví mới
 */
export const walletSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    "string.hex": `"userId" phải là ObjectId hợp lệ`,
    "string.length": `"userId" phải có 24 ký tự`,
    "any.required": `"userId" là bắt buộc`,
  }),

  walletName: Joi.string().trim().max(100).default("Ví chính").messages({
    "string.max": `"walletName" không được vượt quá 100 ký tự`,
  }),

  walletType: Joi.string().valid("PERSONAL", "GROUP").default("PERSONAL").messages({
    "any.only": `"walletType" chỉ nhận giá trị 'PERSONAL' hoặc 'GROUP'`,
  }),

  // Banking info
  bankAccount_holderName: Joi.string().trim().required().messages({
    "string.empty": `"bankAccount_holderName" không được để trống`,
    "any.required": `"bankAccount_holderName" là bắt buộc`,
  }),
  bankAccount_number: Joi.string().trim().required().messages({
    "string.empty": `"bankAccount_number" không được để trống`,
    "any.required": `"bankAccount_number" là bắt buộc`,
  }),
  bankAccount_bankCode: Joi.string().trim().required().messages({
    "string.empty": `"bankAccount_bankCode" không được để trống`,
    "any.required": `"bankAccount_bankCode" là bắt buộc`,
  }),
  bankAccount_napasCode: Joi.string().trim().required().messages({
    "string.empty": `"bankAccount_napasCode" không được để trống`,
    "any.required": `"bankAccount_napasCode" là bắt buộc`,
  }),
  bankAccount_bankName: Joi.string().trim().required().messages({
    "string.empty": `"bankAccount_bankName" không được để trống`,
    "any.required": `"bankAccount_bankName" là bắt buộc`,
  }),

  // Limits
  withdrawLimit: Joi.number().positive().max(100000000).optional().messages({
    "number.base": `"withdrawLimit" phải là số`,
    "number.max": `"withdrawLimit" không được vượt quá 100.000.000"`,
  }),
  depositLimit: Joi.number().positive().max(200000000).optional().messages({
    "number.base": `"depositLimit" phải là số`,
    "number.max": `"depositLimit" không được vượt quá 200.000.000"`,
  }),

  // Optional flags
  pinCode: Joi.string().min(4).max(12).optional().messages({
    "string.min": `"pinCode" phải có ít nhất 4 ký tự`,
    "string.max": `"pinCode" không được vượt quá 12 ký tự`,
  }),

  isLinkedBank: Joi.boolean().default(true),
});

/**
 * Schema kiểm tra dữ liệu cho giao dịch (nạp/rút)
 */
export const transactionSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    "string.hex": `"userId" phải là ObjectId hợp lệ`,
    "string.length": `"userId" phải có 24 ký tự`,
    "any.required": `"userId" là bắt buộc`,
  }),

  amount: Joi.number().positive().required().messages({
    "number.base": `"amount" phải là dạng số`,
    "number.positive": `"amount" phải lớn hơn 0`,
    "any.required": `"amount" là bắt buộc`,
  }),

  description: Joi.string().allow("").max(255).optional().messages({
    "string.max": `"description" không được vượt quá 255 ký tự`,
  }),

  fee: Joi.number().min(0).default(0).messages({
    "number.base": `"fee" phải là dạng số`,
    "number.min": `"fee" không được âm`,
  }),

  deviceInfo: Joi.string().allow("").optional(),
  category: Joi.string().allow("").optional(),
});
