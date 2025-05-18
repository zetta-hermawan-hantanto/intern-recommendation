import { compare } from 'bcrypt';
import { ValidateComparePassword } from './user.validator';

import { isValidObjectId } from 'mongoose';

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
export const GenerateToken = ({ userId }) => {
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
