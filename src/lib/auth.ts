import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export const getAuthUser = (request: NextRequest) => {
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
};

export const requireAuth = (request: NextRequest) => {
  const user = getAuthUser(request);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};
