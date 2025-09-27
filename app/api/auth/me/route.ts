import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { sanitizeString } from "../../../../lib/sanitize";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

async function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return null;
  }
}

export async function GET(request: NextRequest) {
  let client;
  try {
    // Get token from cookies with better error handling
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      console.log("No auth token found in cookies");
      return NextResponse.json(
        { success: false, message: "No authentication token found" },
        { status: 401 }
      );
    }

    // Sanitize token from cookie
    const sanitizedToken = sanitizeString(token);

    if (!sanitizedToken || sanitizedToken.length < 10) {
      console.log("Invalid or corrupted token");
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userFromToken = await getUserFromToken(sanitizedToken);
    if (!userFromToken) {
      console.log("Token verification failed");

      // Clear invalid cookie
      const response = NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );

      response.cookies.set("auth-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      });

      return response;
    }

    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Sanitize email from token for database query
    const sanitizedEmail = sanitizeString(userFromToken.email);

    // Find user in database
    const user = await db
      .collection("users")
      .findOne({ email: sanitizedEmail.toLowerCase() });

    if (!user) {
      console.log("User not found in database:", sanitizedEmail);

      // Clear cookie for non-existent user
      const response = NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

      response.cookies.set("auth-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      });

      return response;
    }

    console.log("User found:", {
      id: user._id,
      email: user.email,
      verified: user.isVerified,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: !!user.isVerified,
            createdAt: user.createdAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("/api/auth/me error:", error?.stack || error);

    // Clear potentially corrupted cookie on server error
    const response = NextResponse.json(
      { success: false, message: "Authentication check failed" },
      { status: 500 }
    );

    return response;
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}
