import Joi from "joi";

export const categorySchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  color: Joi.string().default("gray"),
  description: Joi.string().allow(""),
});
