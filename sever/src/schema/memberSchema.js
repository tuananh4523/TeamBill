import Joi from "joi";

export const memberSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    "string.hex": `"userId" phải là ObjectId hợp lệ`,
    "any.required": `"userId" là bắt buộc`,
  }),

  teamId: Joi.string().hex().length(24).required().messages({
    "string.hex": `"teamId" phải là ObjectId hợp lệ`,
    "any.required": `"teamId" là bắt buộc`,
  }),

  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": `"name" phải có ít nhất {#limit} ký tự`,
    "string.max": `"name" không được vượt quá {#limit} ký tự`,
    "any.required": `"name" là bắt buộc`,
  }),

  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .allow("", null)
    .messages({
      "string.email": `"email" phải là địa chỉ hợp lệ`,
    }),

  avatar: Joi.string().uri().allow("", null).messages({
    "string.uri": `"avatar" phải là URL hợp lệ`,
  }),

  role: Joi.string().valid("admin", "member", "viewer").default("member").messages({
    "any.only": `"role" chỉ nhận giá trị 'admin', 'member' hoặc 'viewer'`,
  }),

  status: Joi.string()
    .valid("active", "inactive", "pending")
    .default("active")
    .messages({
      "any.only": `"status" chỉ nhận giá trị 'active', 'inactive' hoặc 'pending'`,
    }),

  contribution: Joi.number().min(0).default(0).messages({
    "number.min": `"contribution" không được âm`,
  }),

  balance: Joi.number().default(0).messages({
    "number.base": `"balance" phải là số`,
  }),

  joinedAt: Joi.date().default(Date.now),
  leftAt: Joi.date().allow(null),
});
