export type JwtPayload = {
  sub: string; // userId
  email: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
};

