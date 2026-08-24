import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { generateToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

// Compara em tempo constante. O digest normaliza o tamanho, evitando que
// timingSafeEqual lance quando os buffers têm comprimentos diferentes.
const safeEqual = (a: string, b: string): boolean => {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
};

export async function POST(request: NextRequest) {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error(
        "ADMIN_USERNAME and ADMIN_PASSWORD must be defined to enable login"
      );
      return NextResponse.json(
        { error: "Authentication is not configured" },
        { status: 500 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const isValid =
      safeEqual(username, adminUsername) && safeEqual(password, adminPassword);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken({ username: adminUsername });

    const response = NextResponse.json({
      success: true,
      user: { username: adminUsername },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
