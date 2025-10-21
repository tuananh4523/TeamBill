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

  // Danh sách memberId (nếu có)
  members: Joi.array().items(Joi.string().hex().length(24)).messages({
    "string.hex": `"members" phải chứa ObjectId hợp lệ`,
    "string.length": `"members" phải có 24 ký tự`,
  }),
});
