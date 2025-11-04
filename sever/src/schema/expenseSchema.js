import Joi from "joi";

export const expenseSchema = Joi.object({
  teamId: Joi.string().trim().length(24).hex().required().messages({
    "string.base": `"teamId" phải là chuỗi`,
    "string.hex": `"teamId" phải là ObjectId hợp lệ`,
    "string.length": `"teamId" phải có 24 ký tự`,
    "any.required": `"teamId" là bắt buộc`,
  }),

  createdBy: Joi.string().trim().length(24).hex().required().messages({
    "string.base": `"createdBy" phải là chuỗi`,
    "string.hex": `"createdBy" phải là ObjectId hợp lệ`,
    "string.length": `"createdBy" phải có 24 ký tự`,
    "any.required": `"createdBy" là bắt buộc`,
  }),

  title: Joi.string().trim().min(2).max(200).required().messages({
    "string.base": `"title" phải là dạng text`,
    "string.empty": `"title" không được để trống`,
    "string.min": `"title" phải có ít nhất {#limit} ký tự`,
    "string.max": `"title" không được vượt quá {#limit} ký tự`,
    "any.required": `"title" là bắt buộc`,
  }),

  amount: Joi.number().positive().required().messages({
    "number.base": `"amount" phải là dạng số`,
    "number.positive": `"amount" phải lớn hơn 0`,
    "any.required": `"amount" là bắt buộc`,
  }),

  category: Joi.string().trim().max(100).allow("").messages({
    "string.base": `"category" phải là dạng text`,
    "string.max": `"category" không được vượt quá {#limit} ký tự`,
  }),

  description: Joi.string().trim().max(500).allow("").messages({
    "string.base": `"description" phải là dạng text`,
    "string.max": `"description" không được vượt quá {#limit} ký tự`,
  }),

  status: Joi.string()
    .valid("PENDING", "COMPLETED", "CANCELLED")
    .default("PENDING")
    .messages({
      "any.only": `"status" chỉ nhận giá trị 'PENDING', 'COMPLETED' hoặc 'CANCELLED'`,
    }),

  paidBy: Joi.string().trim().length(24).hex().allow(null, "").messages({
    "string.hex": `"paidBy" phải là ObjectId hợp lệ`,
    "string.length": `"paidBy" phải có 24 ký tự`,
  }),

  splitMethod: Joi.string()
    .valid("EQUAL", "PERCENTAGE", "CUSTOM")
    .default("EQUAL")
    .messages({
      "any.only": `"splitMethod" chỉ nhận giá trị 'EQUAL', 'PERCENTAGE' hoặc 'CUSTOM'`,
    }),

  date: Joi.date().optional().messages({
    "date.base": `"date" phải là kiểu ngày hợp lệ`,
  }),
});
