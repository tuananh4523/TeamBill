// schema/paymentSchema.js
import Joi from "joi";

export const vietqrDepositSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": `"userId" là bắt buộc`,
  }),
  amount: Joi.number().min(1000).required().messages({
    "number.base": `"amount" phải là số`,
    "number.min": `"amount" tối thiểu là {#limit} VND`,
    "any.required": `"amount" là bắt buộc`,
  }),
  description: Joi.string().trim().max(255).allow(""),
});
