import jwt from "jsonwebtoken";

export interface JWTPayload {
  username: string;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Please define JWT_SECRET environment variable");
  }

  return secret;
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, getSecret()) as JWTPayload;
  } catch (error) {
    return null;
  }
};
