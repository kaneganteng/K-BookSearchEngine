import { User } from '../models/index.js';
import { signToken } from '../utils/auth.js';
import { AuthenticationError } from '../utils/auth.js';

// Define types for the arguments
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
        authors: [string];
        bookId: string;
        title: string;
        description: string;
        image: string;
        link: string;
    }
}

interface RemoveBookArgs {
    bookId: string;
}

const resolvers = {
    Query: {
        // Query to get the authenticated user's information
        // The 'me' query relies on the context to check if the user is authenticated
        me: async (_parent: any, _args: any, context: any) => {
            // If the user is authenticated, find and return the user's information along with their thoughts
            if (context.user) {
                return User.findOne({ _id: context.user._id });
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
        saveBook: async (_parent: any, { input }: SaveBookArgs, context: any) => {
            if (context.user) {
        
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    {
                        new: true,
                        runValidators: true,
                      }
                );

                return updatedUser;
            }
            throw AuthenticationError;
            ('You need to be logged in!');
        },
        removeBook: async (_parent: any, { bookId }: RemoveBookArgs, context: any) => {
            if (context.user) {               
                const updatedUser =
                    await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $pull: { savedBooks: {bookId: bookId} } },
                        {
                            new: true,
                            runValidators: true,
                          }
                    );
                if (!updatedUser) {
                    return "Couldn't find user with this id!"
                }
                return updatedUser;
            }
            throw AuthenticationError;
        },
    },
};

export default resolvers;
