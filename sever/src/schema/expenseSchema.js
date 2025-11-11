import Joi from 'joi'

export const expenseSchema = Joi.object({
  teamId: Joi.string().required().messages({
    'any.required': `"teamId" là bắt buộc`
  }),
  createdBy: Joi.string().required().messages({
    'any.required': `"createdBy" là bắt buộc`
  }),
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.base': `"title" phải là chuỗi`,
    'string.empty': `"title" không được để trống`,
    'string.min': `"title" phải có ít nhất {#limit} ký tự`,
    'any.required': `"title" là bắt buộc`
  }),
  amount: Joi.number().min(0).required().messages({
    'number.base': `"amount" phải là số`,
    'any.required': `"amount" là bắt buộc`
  }),
  category: Joi.string().trim().max(100).allow(''),
  description: Joi.string().trim().max(500).allow(''),
  paidBy: Joi.string().allow(null, ''),
  splitMethod: Joi.string()
    .valid('equal', 'percentage', 'custom')
    .default('equal'),
  date: Joi.date().allow(null),
  status: Joi.string()
    .valid('pending', 'completed', 'cancelled')
    .default('pending')
})
