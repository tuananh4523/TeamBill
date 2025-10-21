import Joi from "joi";

export const expenseSchema = Joi.object({
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

  category: Joi.string().trim().required().messages({
    "string.base": `"category" phải là dạng text`,
    "string.empty": `"category" không được để trống`,
    "any.required": `"category" là bắt buộc`,
  }),

  status: Joi.string().valid("CHỜ", "HOÀN TẤT").default("CHỜ").messages({
    "any.only": `"status" chỉ nhận giá trị 'CHỜ' hoặc 'HOÀN TẤT'`,
  }),

  person: Joi.string().trim().required().messages({
    "string.base": `"person" phải là dạng text`,
    "string.empty": `"person" không được để trống`,
    "any.required": `"person" là bắt buộc`,
  }),

  date: Joi.date().optional().messages({
    "date.base": `"date" phải là kiểu ngày hợp lệ`,
  }),
});
