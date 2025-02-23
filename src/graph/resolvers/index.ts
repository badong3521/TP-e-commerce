import { getAllNavigation } from "./navigation/navigation-resolver.js";

export const resolvers = {
  Query: {
    navigation: () => getAllNavigation(),
  },
};
