import Joi from "joi";

export const teamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": `"name" phải là dạng text`,
    "string.empty": `"name" không được để trống`,
    "string.min": `"name" phải có ít nhất {#limit} ký tự`,
    "string.max": `"name" không được vượt quá {#limit} ký tự`,
    "any.required": `"name" là bắt buộc`,
  }),

  description: Joi.string().trim().max(500).allow("").messages({
    "string.base": `"description" phải là dạng text`,
    "string.max": `"description" không được vượt quá {#limit} ký tự`,
  }),

  avatar: Joi.string().uri().allow("", null).messages({
    "string.uri": `"avatar" phải là URL hợp lệ`,
  }),

  refCode: Joi.string().trim().max(50).allow("", null).messages({
    "string.max": `"refCode" không được vượt quá {#limit} ký tự`,
  }),

  createdBy: Joi.string().hex().length(24).allow(null, "").messages({
    "string.hex": `"createdBy" phải là ObjectId hợp lệ`,
  }),

  membersCount: Joi.number().min(0).default(1).messages({
    "number.min": `"membersCount" không thể âm`,
  }),

  walletId: Joi.string().hex().length(24).allow(null, "").messages({
    "string.hex": `"walletId" phải là ObjectId hợp lệ`,
  }),

  privacy: Joi.string().valid("public", "private").default("private").messages({
    "any.only": `"privacy" chỉ nhận giá trị 'public' hoặc 'private'`,
  }),

  status: Joi.string()
    .valid("active", "inactive", "archived")
    .default("active")
    .messages({
      "any.only": `"status" chỉ nhận giá trị 'active', 'inactive' hoặc 'archived'`,
    }),

  totalExpense: Joi.number().min(0).default(0).messages({
    "number.min": `"totalExpense" không thể âm`,
  }),

  lastActivity: Joi.date().default(Date.now).messages({
    "date.base": `"lastActivity" phải là kiểu ngày hợp lệ`,
  }),
});
