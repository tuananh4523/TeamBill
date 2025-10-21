import Joi from "joi";

// Schema khi thêm member mới
export const memberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": `"name" phải là dạng text`,
    "string.empty": `"name" không được để trống`,
    "string.min": `"name" phải có ít nhất {#limit} ký tự`,
    "string.max": `"name" không được vượt quá {#limit} ký tự`,
    "any.required": `"name" là bắt buộc`,
  }),

  role: Joi.string().trim().max(50).allow("").messages({
    "string.base": `"role" phải là dạng text`,
    "string.max": `"role" không được vượt quá {#limit} ký tự`,
  }),

  email: Joi.string().email().required().messages({
    "string.email": `"email" không hợp lệ`,
    "any.required": `"email" là bắt buộc`,
  }),

  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE").messages({
    "any.only": `"status" chỉ nhận giá trị 'ACTIVE' hoặc 'INACTIVE'`,
  }),
});

// Schema khi cập nhật member (các field optional)
export const memberUpdateSchema = memberSchema.fork(
  ["name", "role", "email", "status"],
  (field) => field.optional()
);
