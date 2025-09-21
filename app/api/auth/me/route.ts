import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ambatobuy";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return { client, db: client.db("Amba-To-Buy") };
}

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

    const userFromToken = await getUserFromToken(token);
    if (!userFromToken) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Prefer to find user by email (robust against token id serialization differences)
    const user = await db
      .collection("users")
      .findOne({ email: userFromToken.email });

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
    console.error("/api/auth/me error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
