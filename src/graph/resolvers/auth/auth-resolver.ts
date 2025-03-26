import { dbClient } from "../../../client-orm.js";
import { v4 as uuidv4 } from "uuid";
import { GraphQLError } from "graphql";

// Hàm kiểm tra email hợp lệ
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const userResolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      return dbClient.user.findUnique({
        where: { id },
        include: { sessions: true },
      });
    },
    userByProviderId: async (
      _: any,
      { providerId }: { providerId: string }
    ) => {
      return dbClient.user.findUnique({
        where: { id: providerId },
        include: { sessions: true },
      });
    },
    userSessions: async (_: any, { userId }: { userId: string }) => {
      return dbClient.sessions.findMany({
        where: { user_id: userId },
        include: { user: true },
      });
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: any }) => {
      const userId = uuidv4();

      if (!isValidEmail(input.email)) {
        throw new GraphQLError(
          "Email không hợp lệ. Vui lòng nhập đúng định dạng.",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      const existingUser = await dbClient.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new GraphQLError(
          "Email đã tồn tại. Vui lòng sử dụng email khác.",
          {
            extensions: { code: "EMAIL_ALREADY_EXISTS" },
          }
        );
      }

      return dbClient.user.create({
        data: {
          id: userId,
          email: input.email,
          role: "USER",
          username: input.username,
          avatar: input.avatar,
          provider_id: input.providerId,
          provider_type: input.providerType,
          date_created: new Date(),
        },
      });
    },
    createSession: async (_: any, { input }: { input: any }) => {
      return dbClient.sessions.create({
        data: {
          id: input.id,
          user_id: input.userId,
          session_id: input.sessionId,
          access_token: input.accessToken,
          id_token: input.idToken,
          expires_at: input.expiresAt ? new Date(input.expiresAt) : null,
        },
        include: { user: true },
      });
    },
  },
  User: {
    sessions: (parent: any) => {
      return dbClient.sessions.findMany({
        where: { user_id: parent.id },
      });
    },
  },
  Session: {
    user: (parent: any) => {
      return dbClient.user.findUnique({
        where: { id: parent.userId },
      });
    },
  },
};
