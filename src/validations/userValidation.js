import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least {#limit} characters',
    'any.required': 'Name is required',
  }),
  surname: Joi.string().min(2).max(30).required().messages({
    'string.empty': 'Surname cannot be empty',
    'string.min': 'Surname must be at least {#limit} characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least {#limit} characters',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Enter a valid email',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});
