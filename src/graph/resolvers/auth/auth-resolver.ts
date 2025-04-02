import { dbClient } from "../../../client-orm.js";
import { v4 as uuidv4 } from "uuid";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "30s" }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const createSessionForUser = async (userId: string, tokens: { accessToken: string; refreshToken: string }) => {
  return dbClient.sessions.create({
    data: {
      id: uuidv4(),
      user_id: userId,
      session_id: uuidv4(),
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    },
  });
};

const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
  } catch (error) {
    throw new GraphQLError("Access token không hợp lệ hoặc đã hết hạn.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }
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
    verifyAuth: async (_: any, { token }: { token: string }) => {
      const payload = verifyAccessToken(token);
      const user = await dbClient.user.findUnique({
        where: { id: (payload as any).userId },
      });

      if (!user) {
        throw new GraphQLError("Người dùng không tồn tại.", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      return user;
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: any }) => {
      let userId;
      if (!input.id) {
        userId = uuidv4();
      }

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
          id: input.id || userId,
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
    register: async (_: any, { input }: { input: any }) => {
      if (!isValidEmail(input.email)) {
        throw new GraphQLError("Email không hợp lệ. Vui lòng nhập đúng định dạng.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const existingUser = await dbClient.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new GraphQLError("Email đã tồn tại. Vui lòng sử dụng email khác.", {
          extensions: { code: "EMAIL_ALREADY_EXISTS" },
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await dbClient.user.create({
        data: {
          id: uuidv4(),
          email: input.email,
          username: input.username,
          password: hashedPassword,
          role: "USER",
          date_created: new Date(),
        },
      });

      const tokens = generateTokens(user);
      await createSessionForUser(user.id, tokens);

      return { user, ...tokens };
    },
    login: async (_: any, { input }: { input: any }) => {
      const user = await dbClient.user.findUnique({
        where: { email: input.email },
      });

      if (!user || !user.password || !(await bcrypt.compare(input.password, user.password))) {
        throw new GraphQLError("Email hoặc mật khẩu không đúng.", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const tokens = generateTokens(user);
      await createSessionForUser(user.id, tokens);

      return { user, ...tokens };
    },
    refreshToken: async (_: any, { token }: { token: string }) => {
      try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
        const user = await dbClient.user.findUnique({
          where: { id: (payload as any).userId },
        });

        if (!user) {
          throw new GraphQLError("Người dùng không tồn tại.", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        const tokens = generateTokens(user);
        return tokens;
      } catch (error) {
        throw new GraphQLError("Refresh token không hợp lệ.", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }
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
