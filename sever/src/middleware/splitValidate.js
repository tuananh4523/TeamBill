import Joi from "joi";

// Định nghĩa schema kiểm tra dữ liệu Split
const splitSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.base": `"title" phải là text`,
    "string.empty": `"title" không được để trống`,
    "string.min": `"title" phải có ít nhất {#limit} ký tự`,
    "any.required": `"title" là bắt buộc`,
  }),
  amount: Joi.number().positive().required().messages({
    "number.base": `"amount" phải là số`,
    "number.positive": `"amount" phải lớn hơn 0`,
    "any.required": `"amount" là bắt buộc`,
  }),
  payer: Joi.string().required().messages({
    "string.base": `"payer" phải là text`,
    "any.required": `"payer" là bắt buộc`,
  }),
  participants: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.base": `"participants" phải là mảng`,
    "array.min": `"participants" phải có ít nhất 1 người`,
    "any.required": `"participants" là bắt buộc`,
  }),
  date: Joi.date().default(Date.now).messages({
    "date.base": `"date" phải là ngày hợp lệ`,
  }),
});

// Middleware validate
export const validateSplit = (req, res, next) => {
  const { error } = splitSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
