import Joi from 'joi';

export const reviewSchema = Joi.object({
  text: Joi.string().min(10).max(500).required().messages({
    'string.empty': 'Review text cannot be empty',
    'string.min': 'Review must be at least 10 characters long',
  }),
  photo: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'Photo must be a valid URL',
  }),
});
