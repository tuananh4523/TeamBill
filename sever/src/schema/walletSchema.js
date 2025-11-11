import Joi from "joi";

export const walletSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": `"userId" là bắt buộc`,
  }),
  walletName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": `"walletName" không được để trống`,
    "any.required": `"walletName" là bắt buộc`,
  }),
  walletType: Joi.string().valid("personal", "group").default("personal"),
  balance: Joi.number().min(0).default(0),
  totalDeposit: Joi.number().min(0).default(0),
  totalWithdraw: Joi.number().min(0).default(0),
  withdrawLimit: Joi.number().min(0).default(0),
  depositLimit: Joi.number().min(0).default(0),
  bankAccount_holderName: Joi.string().trim().allow(""),
  bankAccount_number: Joi.string().trim().allow(""),
  bankAccount_bankCode: Joi.string().trim().allow(""),
  bankAccount_napasCode: Joi.string().trim().allow(""),
  bankAccount_bankName: Joi.string().trim().allow(""),
  status: Joi.string().valid("active", "inactive", "locked").default("active"),
  pinCode: Joi.string().trim().allow(""),
  isLinkedBank: Joi.boolean().default(false),
  activatedAt: Joi.date().allow(null),
  lastUpdated: Joi.date().allow(null),
});
