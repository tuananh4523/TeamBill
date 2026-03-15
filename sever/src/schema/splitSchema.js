import Joi from "joi";

export const splitSchema = Joi.object({
  expenseId: Joi.string().required().messages({
    "any.required": `"expenseId" là bắt buộc`,
  }),
  teamId: Joi.string().required().messages({
    "any.required": `"teamId" là bắt buộc`,
  }),
  categoryId: Joi.string().allow(null, ''),
  total: Joi.number().min(0).required().messages({
    "number.base": `"total" phải là số`,
    "any.required": `"total" là bắt buộc`,
  }),
  method: Joi.string().valid("equal", "percentage", "custom").default("equal"),
  currency: Joi.string().trim().max(10).default("VND"),
  date: Joi.date().allow(null),
  note: Joi.string().trim().allow("").default(""),
});
