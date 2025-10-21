import Joi from "joi";

export const userSchema = Joi.object({
  username: Joi.string().min(2).max(100).required().messages({
    'string.trim': `"username" không được chứa khoảng trắng`,
    'string.empty': `"username" không được để trống`,
    'any.required': `"username" là bắt buộc`,
  }),
  email: Joi.string().email().required().messages({
    'string.base': `"email" phải là một loại 'text'`,
    'string.empty': `"email" không được để trống`,
    'string.email': `"email" phải là một email hợp lệ`,
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': `"password" phải là một loại 'text'`,
    'string.empty': `"password" không được để trống`,
    'string.min': `"password" phải có độ dài tối thiểu là {#limit}`,
  }),
  age: Joi.number().min(0).optional().messages({
    'number.base': `"age" phải là một loại 'number'`,
    'number.min': `"age" phải lớn hơn hoặc bằng {#limit}`,
  }),
});
