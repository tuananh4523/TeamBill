import Joi from "joi";

export const splitSchema = Joi.object({
  expenseId: Joi.string().hex().length(24).required().messages({
    "string.hex": `"expenseId" phải là ObjectId hợp lệ`,
    "string.length": `"expenseId" phải có 24 ký tự`,
    "any.required": `"expenseId" là bắt buộc`,
  }),

  teamId: Joi.string().hex().length(24).required().messages({
    "string.hex": `"teamId" phải là ObjectId hợp lệ`,
    "string.length": `"teamId" phải có 24 ký tự`,
    "any.required": `"teamId" là bắt buộc`,
  }),

  total: Joi.number().min(0).required().messages({
    "number.base": `"total" phải là dạng số`,
    "number.min": `"total" không được âm"`,
    "any.required": `"total" là bắt buộc`,
  }),

  method: Joi.string()
    .valid("EQUAL", "PERCENTAGE", "CUSTOM")
    .default("EQUAL")
    .messages({
      "any.only": `"method" chỉ nhận 'EQUAL', 'PERCENTAGE' hoặc 'CUSTOM'`,
    }),

  currency: Joi.string().trim().uppercase().max(10).default("VND").messages({
    "string.base": `"currency" phải là dạng text`,
    "string.max": `"currency" không được vượt quá {#limit} ký tự`,
  }),

  date: Joi.date().optional().messages({
    "date.base": `"date" phải là kiểu ngày hợp lệ`,
  }),

  members: Joi.array()
    .items(
      Joi.object({
        memberId: Joi.string().hex().length(24).required().messages({
          "string.hex": `"memberId" phải là ObjectId hợp lệ`,
          "string.length": `"memberId" phải có 24 ký tự`,
          "any.required": `"memberId" là bắt buộc"`,
        }),

        name: Joi.string().trim().min(2).max(100).required().messages({
          "string.base": `"name" phải là dạng text`,
          "string.empty": `"name" không được để trống`,
          "string.min": `"name" phải có ít nhất {#limit} ký tự`,
          "string.max": `"name" không được vượt quá {#limit} ký tự`,
          "any.required": `"name" là bắt buộc"`,
        }),

        paid: Joi.number().min(0).default(0).messages({
          "number.base": `"paid" phải là dạng số`,
          "number.min": `"paid" không được nhỏ hơn 0"`,
        }),

        owed: Joi.number().min(0).default(0).messages({
          "number.base": `"owed" phải là dạng số`,
          "number.min": `"owed" không được nhỏ hơn 0"`,
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": `"members" phải là một mảng hợp lệ`,
      "array.min": `"members" phải có ít nhất 1 phần tử"`,
      "any.required": `"members" là bắt buộc"`,
    }),
});
