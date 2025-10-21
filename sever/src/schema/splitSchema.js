// schema/splitSchema.js
import Joi from "joi";

export const splitSchema = Joi.object({
  members: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required().messages({
          "string.base": `"name" phải là dạng text`,
          "string.empty": `"name" không được để trống`,
        }),
        paid: Joi.number().min(0).required().messages({
          "number.base": `"paid" phải là dạng số`,
          "number.min": `"paid" không được âm`,
          "any.required": `"paid" là bắt buộc`,
        }),
      })
    )
    .min(1)
    .required(),

  total: Joi.number().positive().required().messages({
    "number.base": `"total" phải là số`,
    "number.positive": `"total" phải > 0`,
    "any.required": `"total" là bắt buộc`,
  }),

  date: Joi.date().optional(),
});
