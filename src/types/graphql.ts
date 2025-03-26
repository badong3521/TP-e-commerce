export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateSessionInput = {
  accessToken?: InputMaybe<Scalars['String']['input']>;
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  idToken?: InputMaybe<Scalars['String']['input']>;
  sessionId: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};

export type CreateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  providerId: Scalars['String']['input'];
  providerType: TypeProvider;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type File = {
  __typename?: 'File';
  filename_disk?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createSession: Session;
  createUser: User;
};


export type MutationCreateSessionArgs = {
  input: CreateSessionInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type Navigation = {
  __typename?: 'Navigation';
  children?: Maybe<Array<Navigation>>;
  id: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  navigation: Array<Navigation>;
  user?: Maybe<User>;
  userByProviderId?: Maybe<User>;
  userSessions?: Maybe<Array<Session>>;
};


export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};


export type QueryUserByProviderIdArgs = {
  providerId: Scalars['String']['input'];
};


export type QueryUserSessionsArgs = {
  userId: Scalars['Int']['input'];
};

export type Session = {
  __typename?: 'Session';
  accessToken?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  expiresAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  idToken?: Maybe<Scalars['String']['output']>;
  sessionId: Scalars['String']['output'];
  user: User;
  userId: Scalars['Int']['output'];
};

export enum TypeProvider {
  Facebook = 'facebook',
  Google = 'google'
}

export enum TypeRole {
  Admin = 'ADMIN',
  Guest = 'GUEST',
  User = 'USER'
}

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  provider_id: Scalars['String']['output'];
  provider_type: TypeProvider;
  role: TypeRole;
  sessions?: Maybe<Array<Session>>;
  username?: Maybe<Scalars['String']['output']>;
};
