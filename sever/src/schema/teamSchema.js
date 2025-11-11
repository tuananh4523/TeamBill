import Joi from "joi";

export const teamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": `"name" không được để trống`,
    "any.required": `"name" là bắt buộc`,
  }),
  description: Joi.string().trim().max(500).allow(""),
  avatar: Joi.string().allow(""),
  createdBy: Joi.string().required().messages({
    "any.required": `"createdBy" là bắt buộc`,
  }),
  walletId: Joi.string().allow(null, ""),
  privacy: Joi.string().valid("public", "private", "invite-only").default("private"),
  status: Joi.string().valid("active", "inactive", "archived").default("active"),
  totalExpense: Joi.number().min(0).default(0),
  membersCount: Joi.number().min(0).default(0),
  lastActivity: Joi.date().allow(null),
});
