import mongoose, { mongo } from 'mongoose';

let connection = null;

/**
 * The function `connectToDatabase` establishes a connection to MongoDB using the provided URI and
 * returns the connection object.
 * @returns The `connectToDatabase` function returns the MongoDB connection if it is already
 * established, or establishes a new connection to the MongoDB database using the provided URI and
 * returns the connection. If there is an error during the connection process, it will log the error
 * and throw a new error indicating that the connection to MongoDB failed.
 */
export const connectToDatabase = async () => {
  try {
    if (connection) {
      console.log('MongoDB connection already established');
      return connection;
    }

    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    connection = await mongoose.connect(mongoURI);
    console.log('MongoDB connection established successfully');

    return connection;
  } catch (error) {
    console.log('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

