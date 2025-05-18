// *************** IMPORT LIBRARIES ***************
import Joi from 'joi';
import { GraphQLError } from 'graphql';

const passwordRegex = new RegExp('^[a-zA-Z0-9]{3,30}$');

export function ValidateLoginInput({ email, password }) {
  const schema = Joi.object({
    email: Joi.string().email().required().error(new GraphQLError('Invalid email format')),
    password: Joi.string()
      .min(8)
      .pattern(passwordRegex)
      .required()
      .error(new GraphQLError('Password must be at least 8 characters long and contain only alphanumeric characters')),
  });

  const { error } = schema.validate({ email, password });

  if (error && error.message) throw new GraphQLError(error.message);
}

export function ValidateComparePassword({ password, hashedPassword }) {
  const schema = Joi.object({
    password: Joi.string()
      .min(8)
      .pattern(passwordRegex)
      .required()
      .error(new GraphQLError('Password must be at least 8 characters long and contain only alphanumeric characters')),
    hashedPassword: Joi.string().required().error(new GraphQLError('Hashed password is required')),
  });

  const { error } = schema.validate({ password, hashedPassword });

  if (error && error.message) throw new GraphQLError(error.message);
}

export function ValidateRegisterUser({ name, email, password }) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required().error(new GraphQLError('Name must be between 3 and 30 characters')),
    email: Joi.string().email().required().error(new GraphQLError('Invalid email format')),
    password: Joi.string()
      .min(8)
      .pattern(passwordRegex)
      .required()
      .error(new GraphQLError('Password must be at least 8 characters long and contain only alphanumeric characters')),
  });

  const { error } = schema.validate({ name, email, password });

  if (error && error.message) throw new GraphQLError(error.message);
}
