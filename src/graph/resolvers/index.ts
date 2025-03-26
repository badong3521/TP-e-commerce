import { getAllNavigation } from "./navigation/navigation-resolver.js";
import { userResolvers } from "./auth/auth-resolver.js";

export const resolvers = {
  Query: {
    navigation: () => getAllNavigation(),
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
  User: userResolvers.User,
  Session: userResolvers.Session,
};
