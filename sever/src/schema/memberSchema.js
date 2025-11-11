import Joi from "joi";

export const memberSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": `"userId" là bắt buộc`,
  }),
  teamId: Joi.string().required().messages({
    "any.required": `"teamId" là bắt buộc`,
  }),
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": `"name" không được để trống`,
    "any.required": `"name" là bắt buộc`,
  }),
  email: Joi.string().email().required().messages({
    "string.email": `"email" không hợp lệ`,
    "any.required": `"email" là bắt buộc`,
  }),
  avatar: Joi.string().allow(""),
  role: Joi.string().valid("owner", "admin", "member").default("member"),
  status: Joi.string().valid("active", "inactive", "left").default("active"),
  joinedAt: Joi.date().allow(null),
  leftAt: Joi.date().allow(null),
  contribution: Joi.number().min(0).default(0),
  balance: Joi.number().default(0),
});
