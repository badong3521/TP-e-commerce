import { getAllNavigation } from "./navigation/navigation-resolver.js";
import { userResolvers } from "./auth/auth-resolver.js";
import { productQueryResolvers, productResolvers, collectionResolvers, tagResolvers } from "./products/product-resolver.js";

export const resolvers = {
  Query: {
    navigation: () => getAllNavigation(),
    ...userResolvers.Query,
    ...productQueryResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
  User: userResolvers.User,
  Session: userResolvers.Session,
  Product: productResolvers.Product,
  Collection: collectionResolvers.Collection,
  Tag: tagResolvers.Tag,
};
