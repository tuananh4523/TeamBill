import Joi from "joi";

export const userSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": `"username" không được để trống`,
    "any.required": `"username" là bắt buộc`,
  }),
  password: Joi.string().trim().min(6).max(100).required().messages({
    "string.empty": `"password" không được để trống`,
    "any.required": `"password" là bắt buộc`,
  }),
  email: Joi.string().email().required().messages({
    "string.email": `"email" không hợp lệ`,
    "any.required": `"email" là bắt buộc`,
  }),
  phone: Joi.string().trim().allow(""),
  fullName: Joi.string().trim().max(100).allow(""),
  avatar: Joi.string().allow(""),
  gender: Joi.string().valid("male", "female", "other").default("other"),
  dateOfBirth: Joi.date().allow(null),
  role: Joi.string().valid("admin", "member").default("member"),
  isVerified: Joi.boolean().default(false),
  verifyToken: Joi.string().allow(""),
  resetToken: Joi.string().allow(""),
  resetTokenExpiry: Joi.date().allow(null),
  lastLogin: Joi.date().allow(null),
  isActive: Joi.boolean().default(true),
  address: Joi.string().trim().allow(""),
  joinedAt: Joi.date().allow(null),
});
