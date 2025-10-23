import Joi from "joi";

export const userSchema = Joi.object({
  username: Joi.string().min(3).max(100).required().messages({
    "string.base": `"username" phải là dạng chuỗi`,
    "string.empty": `"username" không được để trống`,
    "string.min": `"username" phải có ít nhất {#limit} ký tự`,
    "string.max": `"username" không được vượt quá {#limit} ký tự`,
    "any.required": `"username" là bắt buộc`,
  }),

  email: Joi.string().email().required().messages({
    "string.base": `"email" phải là dạng chuỗi`,
    "string.empty": `"email" không được để trống`,
    "string.email": `"email" phải là email hợp lệ`,
    "any.required": `"email" là bắt buộc`,
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": `"password" phải là dạng chuỗi`,
    "string.empty": `"password" không được để trống`,
    "string.min": `"password" phải có ít nhất {#limit} ký tự`,
    "any.required": `"password" là bắt buộc`,
  }),

  fullName: Joi.string().trim().max(120).allow("").messages({
    "string.base": `"fullName" phải là dạng chuỗi`,
    "string.max": `"fullName" không được vượt quá {#limit} ký tự`,
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{8,15}$/)
    .allow("")
    .messages({
      "string.pattern.base": `"phone" phải là số hợp lệ (8–15 chữ số)`,
    }),

  gender: Joi.string().valid("male", "female", "other").default("other").messages({
    "any.only": `"gender" chỉ nhận giá trị 'male', 'female', hoặc 'other'`,
  }),

  dateOfBirth: Joi.date().optional().messages({
    "date.base": `"dateOfBirth" phải là kiểu ngày hợp lệ`,
  }),

  address: Joi.string().allow("").max(255).messages({
    "string.max": `"address" không được vượt quá {#limit} ký tự`,
  }),

  role: Joi.string().valid("admin", "member").default("member").messages({
    "any.only": `"role" chỉ nhận giá trị 'admin' hoặc 'member'`,
  }),

  isVerified: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});
