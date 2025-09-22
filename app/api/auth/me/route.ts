import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { sanitizeString } from "../../../../lib/sanitize";
import jwt from "jsonwebtoken";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ambatobuy";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

async function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  let client;
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Sanitize token from cookie
    const sanitizedToken = sanitizeString(token);

    const userFromToken = await getUserFromToken(sanitizedToken);
    if (!userFromToken) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Sanitize email from token for database query
    const sanitizedEmail = sanitizeString(userFromToken.email);

    // Prefer to find user by email (robust against token id serialization differences)
    const user = await db
      .collection("users")
      .findOne({ email: sanitizedEmail.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isVerified: !!user.isVerified,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/auth/me error:", (error as any)?.stack || error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
