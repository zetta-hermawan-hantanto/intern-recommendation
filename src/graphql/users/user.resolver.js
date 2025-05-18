// *************** IMPORT LIBRARIES ***************
import { GraphQLError } from 'graphql';

// *************** IMPORT MODULES ***************
import UserModel from './user.model.js';

// *************** IMPORT HELPERS ***************
import { ComparePassword, GenerateToken } from './user.helper.js';

// *************** IMPORT VALIDATORS ***************
import { ValidateLoginInput } from './user.validator.js';
import { isValidObjectId } from 'mongoose';

/**
 * The function `GetUserById` fetches a user by their ID asynchronously, handling errors and returning
 * the user object if found.
 * @param parent - The `parent` parameter typically refers to the parent object that the current field
 * is being resolved on. In this case, it seems like the function `GetUserById` is a resolver function
 * for a GraphQL query or mutation, and the `parent` parameter would contain the parent object if this
 * resolver is
 * @returns The function `GetUserById` is returning the user object fetched from the database using the
 * `userId` provided as input. If the user is not found or if there is an error during the process, a
 * `GraphQLError` is thrown with an appropriate message.
 */
async function GetUserById(parent, { userId }) {
  try {
    if (!userId || !isValidObjectId(userId)) {
      throw new GraphQLError('User ID is required');
    }

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw new GraphQLError('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new GraphQLError(error.message);
  }
}

/**
 * The function `LoginUser` handles user login by validating input, checking credentials, generating a
 * token, and setting a cookie with the token.
 * @param parent - The `parent` parameter in this function typically refers to the parent object that
 * contains the current field being resolved. In a GraphQL resolver function, the `parent` parameter is
 * used when resolving nested fields or relationships between types. It allows you to access the parent
 * object's properties or data to resolve the current
 * @returns The function `LoginUser` returns an object containing the `user` data if the login process
 * is successful.
 */
async function LoginUser(parent, { email, password }, { response }) {
  try {
    ValidateLoginInput({ email, password });

    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
      throw new GraphQLError('Email or password is incorrect');
    }

    const isPasswordValid = await ComparePassword({ password, hashedPassword: user.password });
    if (!isPasswordValid) {
      throw new GraphQLError('Email or password is incorrect');
    }

    const token = GenerateToken({ userId: user._id });
    if (!token) {
      throw new GraphQLError('Failed to generate token');
    }

    response.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw new GraphQLError(error.message);
  }
}

export default {
  Query: {
    GetUserById,
  },
  Mutation: {
    LoginUser,
  },
};
