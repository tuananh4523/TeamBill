import Joi from "joi";

export const transactionSchema = Joi.object({
  walletId: Joi.string().required().messages({
    "any.required": `"walletId" là bắt buộc`,
  }),
  userId: Joi.string().required().messages({
    "any.required": `"userId" là bắt buộc`,
  }),
  type: Joi.string()
    .valid("deposit", "withdraw", "transfer", "payment")
    .required()
    .messages({
      "any.required": `"type" là bắt buộc`,
    }),
  direction: Joi.string().valid("in", "out").required().messages({
    "any.required": `"direction" là bắt buộc`,
  }),
  category: Joi.string().trim().max(100).allow(""),
  amount: Joi.number().min(0).required().messages({
    "number.base": `"amount" phải là số`,
    "any.required": `"amount" là bắt buộc`,
  }),
  fee: Joi.number().min(0).default(0),
  description: Joi.string().trim().max(500).allow(""),
  status: Joi.string().valid("pending", "completed", "failed").default("completed"),
  deviceInfo: Joi.string().trim().allow(""),
  date: Joi.date().allow(null),
});
