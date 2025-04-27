const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required(),
    role: Joi.string().required().valid("customer", "store"),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required(),
  });
  return schema.validate(data);
};

const beanValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    weight: Joi.number().min(50).max(5000).required(),
    cultivar: Joi.string().required(),
    processing: Joi.string().min(2).max(10).required(),
    roast: Joi.string().required(),
    description: Joi.string().min(10).max(100).required(),
    price: Joi.number().required(),
    image: Joi.string().allow(null, "").optional(),
  });
  return schema.validate(data);
};

module.exports = { registerValidation, loginValidation, beanValidation };
