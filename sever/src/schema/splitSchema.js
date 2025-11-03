// schema/splitSchema.js
import Joi from "joi";

export const splitSchema = Joi.object({
  expenseId: Joi.string().hex().length(24).required().messages({
    "string.hex": `"expenseId" phải là ObjectId hợp lệ`,
    "any.required": `"expenseId" là bắt buộc`,
  }),
  teamId: Joi.string().hex().length(24).required().messages({
    "string.hex": `"teamId" phải là ObjectId hợp lệ`,
    "any.required": `"teamId" là bắt buộc`,
  }),
  total: Joi.number().positive().required().messages({
    "number.base": `"total" phải là số`,
    "number.positive": `"total" phải > 0`,
    "any.required": `"total" là bắt buộc`,
  }),
  method: Joi.string()
    .valid("EQUAL", "PERCENTAGE", "CUSTOM")
    .default("EQUAL")
    .messages({
      "any.only": `"method" chỉ nhận 'EQUAL', 'PERCENTAGE', 'CUSTOM'`,
    }),
  currency: Joi.string().max(10).default("VND"),
  members: Joi.array()
    .items(
      Joi.object({
        memberId: Joi.string().hex().length(24).required(),
        name: Joi.string().required(),
        paid: Joi.number().min(0).required(),
        owed: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": `"members" phải có ít nhất 1 phần tử`,
    }),
});
