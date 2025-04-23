import { getAllNavigation } from "./navigation/navigation-resolver.js";
import { userResolvers } from "./auth/auth-resolver.js";
import {
  productQueryResolvers,
  productResolvers,
} from "./products/product-resolver.js";
import {
  collectionQueryResolvers,
  collectionResolvers,
} from "./collections/collections-resolver.js";
// import { tagResolvers } from "./tags/tag-resolver.js";

export const resolvers = {
  Query: {
    navigation: () => getAllNavigation(),
    ...userResolvers.Query,
    ...productQueryResolvers.Query,
    ...collectionQueryResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
  User: userResolvers.User,
  Session: userResolvers.Session,
  Product: productResolvers.Product,
  Collection: collectionResolvers.Collection,
  // Tag: tagResolvers.Tag,
};
