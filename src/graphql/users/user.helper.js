// *************** IMPORT LIBRARIES ***************
import jwt from 'jsonwebtoken';
import { compare, genSalt, hash } from 'bcrypt';
import { GraphQLError } from 'graphql';
import { isValidObjectId } from 'mongoose';

// *************** IMPORT VALIDATORS ***************
import { ValidateComparePassword } from './user.validator.js';

/**
 * The function `ComparePassword` compares a plain text password with a hashed password asynchronously.
 * @returns The `ComparePassword` function is returning a boolean value `isMatch`, which indicates
 * whether the provided `password` matches the `hashedPassword` after comparison.
 */
export const ComparePassword = async ({ password, hashedPassword }) => {
  try {
    ValidateComparePassword({ password, hashedPassword });

    const isMatch = await compare(password, hashedPassword);

    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new GraphQLError(error.message);
  }
};

/**
 * The function `GenerateToken` generates a JWT token for a given user ID with a one-hour expiration
 * time.
 * @returns The GenerateToken function returns a JSON Web Token (JWT) that is generated using the
 * userId provided as the payload, the JWT_SECRET stored in the environment variables, and with an
 * expiration time of 1 hour.
 */
export const GenerateToken = async ({ userId }) => {
  try {
    if (!userId || !isValidObjectId(userId)) {
      throw new GraphQLError('User ID is required to generate a token and must be a valid ObjectId');
    }

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new GraphQLError(error.message);
  }
};

/**
 * The function `HashPassword` hashes a given password using bcrypt with error handling.
 * @returns The function `HashPassword` is returning the hashed password after generating a salt and
 * hashing the input password.
 */
export const HashPassword = async ({ password }) => {
  try {
    if (!password || typeof password !== 'string') {
      throw new GraphQLError('Password is required and must be a string');
    }

    const salt = await genSalt(10);
    if (!salt) {
      throw new GraphQLError('Failed to generate salt for password hashing');
    }

    const hashedPassword = hash(password, salt);
    if (!hashedPassword) {
      throw new GraphQLError('Failed to hash password');
    }

    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new GraphQLError(error.message);
  }
};
