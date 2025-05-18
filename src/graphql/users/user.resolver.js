// *************** IMPORT LIBRARIES ***************
import { isValidObjectId } from 'mongoose';
import { GraphQLError } from 'graphql';

// *************** IMPORT MODULES ***************
import UserModel from './user.model.js';

// *************** IMPORT HELPERS ***************
import { ComparePassword, GenerateToken, HashPassword } from './user.helper.js';

// *************** IMPORT VALIDATORS ***************
import { ValidateLoginInput, ValidateRegisterUser } from './user.validator.js';

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
async function LoginUser(parent, { email, password }, { res }) {
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

    const token = await GenerateToken({ userId: user._id });
    if (!token) {
      throw new GraphQLError('Failed to generate token');
    }

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw new GraphQLError(error.message);
  }
}

/**
 * The function `RegisterUser` registers a new user by validating input, checking for existing users,
 * hashing the password, and creating a new user in the database.
 * @param parent - The `parent` parameter in this function typically refers to the parent object that
 * the current resolver is operating on. It is commonly used in GraphQL resolvers to access data from
 * the parent object when resolving nested fields. In this case, it seems like the `RegisterUser`
 * function is a resolver for a
 * @returns The function `RegisterUser` is returning the newly created user object if the registration
 * process is successful. If any errors occur during the registration process, it will throw a
 * `GraphQLError` with the corresponding error message.
 */
async function RegisterUser(parent, { name, email, password }) {
  try {
    ValidateRegisterUser({ name, email, password });

    const existingUser = await UserModel.findOne({ email }).select('_id').lean();

    if (existingUser) {
      throw new GraphQLError('Email already exists');
    }

    const hashedPassword = await HashPassword({ password });
    if (!hashedPassword) {
      throw new GraphQLError('Failed to hash password');
    }

    const newUser = await UserModel.create({ name, email, password: hashedPassword });
    if (!newUser) {
      throw new GraphQLError('Failed to create user');
    }

    return newUser;
  } catch (error) {
    console.log('Error registering user:', error);
    throw new GraphQLError(error.message);
  }
}

/**
 * The function `LogoutUser` clears the 'token' cookie from the response object to log out a user and
 * returns a success message.
 * @param parent - The `parent` parameter typically refers to the parent object in a resolver function
 * when using GraphQL. It represents the result returned from the resolver on the parent field. In this
 * case, it seems like the `LogoutUser` function is a resolver function for a GraphQL mutation or
 * query.
 * @param args - The `args` parameter typically contains the arguments passed to the function. In the
 * context of your `LogoutUser` function, the `args` parameter might include any specific arguments
 * needed for logging out a user, such as user ID or session information. These arguments would be used
 * within the function to perform
 * @returns The function `LogoutUser` is returning an object with a `message` property set to 'Logged
 * out successfully'.
 */
async function LogoutUser(parent, args, { res }) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    });

    return 'Logged out successfully';
  } catch (error) {
    console.error('Error logging out user:', error);
    throw new GraphQLError(error.message);
  }
}

// *************** EXPORT MODULES ***************
export default {
  Query: {
    GetUserById,
  },
  Mutation: {
    RegisterUser,
    LoginUser,
    LogoutUser,
  },
};
