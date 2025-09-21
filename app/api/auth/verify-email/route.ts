// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ambatobuy";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

// Helper function to connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return { client, db: client.db("Amba-To-Buy") };
}

// Helper function to get user from token
async function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let client;

  try {
    const body = await request.json();
    const { otp } = body;

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please login again.",
        },
        { status: 401 }
      );
    }

    // Decode token to get user info
    const userFromToken = await getUserFromToken(token);
    if (!userFromToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token. Please login again.",
        },
        { status: 401 }
      );
    }

    // Validation
    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit verification code",
        },
        { status: 400 }
      );
    }

    // Connect to database
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Find user by ID (try ObjectId) or fallback to email
    let user = null;
    if (userFromToken.userId) {
      try {
        user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(userFromToken.userId) });
      } catch (e) {
        // ignore and fallback to email
      }
    }

    if (!user && userFromToken.email) {
      user = await db
        .collection("users")
        .findOne({ email: userFromToken.email.toLowerCase() });
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email already verified",
          data: {
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              isVerified: true,
            },
          },
        },
        { status: 200 }
      );
    }

    // Check if verification code exists and not expired
    if (!user.verificationCode) {
      return NextResponse.json(
        {
          success: false,
          message: "No verification code found. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (new Date() > new Date(user.verificationExpires)) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (user.verificationCode !== otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code. Please try again.",
        },
        { status: 400 }
      );
    }

    // Update user as verified
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          verificationCode: "",
          verificationExpires: "",
        },
      }
    );

    // Generate new token with updated verification status
    const newToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        isVerified: true,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Email verified successfully!",
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isVerified: true,
          },
        },
      },
      { status: 200 }
    );

    // Update cookie with new token
    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
