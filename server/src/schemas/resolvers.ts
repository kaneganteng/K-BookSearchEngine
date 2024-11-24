import { BookDocument } from '../models/Book.js';
import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

// Define types for the arguments
interface IUser {
  _id: string;
  username: string;
  email: string;
  bookCount: number;
  savedBooks: BookDocument[];
}
interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  }
}

interface LoginUserArgs {
  email: string;
  password: string;
}

interface SaveBookArgs {
  input: {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
  };
}

interface removeBookArgs {
  bookId: string;
}

interface Context {
  user?: IUser
}

const resolvers = {
  Query: {
    
    me: async (_parent: any, _args: any, context: Context) => {
      // If the user is authenticated, find and return the user's information along with their books
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks');

        return userData;
      }
      // If the user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError('Could not authenticate user.');
    },
  },
  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      // Create a new user with the provided username, email, and password
      const user = await User.create({ ...input });

      // Sign a token with the user's information
      const token = signToken(user.username, user.email, user._id);

      // Return the token and the user
      return { token, user };
    },

    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      // Find a user with the provided email
      const user = await User.findOne({ email });

      // If no user is found, throw an AuthenticationError
      if (!user) {
        throw new AuthenticationError('Could not authenticate user.');
      }

      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);

      // If the password is incorrect, throw an AuthenticationError
      if (!correctPw) {
        throw new AuthenticationError('Could not authenticate user.');
      }

      // Sign a token with the user's information
      const token = signToken(user.username, user.email, user._id);

      // Return the token and the user
      return { token, user };
    },

    saveBook: async (_parent: any, { input }: SaveBookArgs, context: Context) => {
      if (context.user) {
        const newBookUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return newBookUser;
      } else {
        throw new AuthenticationError('Log in to save a book');
      }
    },

    removeBook: async (_parent: any, { bookId }: removeBookArgs, context: Context) => {
      if (context.user) {
        const removeBookUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return removeBookUser;
      } else {
        throw new AuthenticationError('Log in to remove a book from saved books');
      }
    }

  },
}

export default resolvers;
