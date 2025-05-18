// *************** IMPORT LIBRARIES ***************
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';

// *************** IMPORT MODULES ***************
import userResolver from './users/user.resolver.js';
import userTypedef from './users/user.typedef.js';

export const resolvers = mergeResolvers([userResolver]);
export const typeDefs = mergeTypeDefs([userTypedef]);
