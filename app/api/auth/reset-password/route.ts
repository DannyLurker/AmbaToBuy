// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { connectToDatabase } from "../../../../lib/mongodb";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ambatobuy";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

// Helper function to connect to MongoDB
// ...using centralized `connectToDatabase` from `lib/mongodb`

export async function POST(request: NextRequest) {
  let client;

  try {
    const body = await request.json();
    const { token, password, passwordConfirm } = body;

    // Validation
    if (!token || !password || !passwordConfirm) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    if (password !== passwordConfirm) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 }
      );
    }

    // Connect to database
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Find user by reset token
    const user = await db.collection("users").findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset token",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Update user password and remove reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
      }
    );

    // Generate new JWT token for auto-login
    const jwtToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Password reset successfully! You are now logged in.",
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
          },
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for auto-login
    response.cookies.set("auth-token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reset password error:", (error as any)?.stack || error);
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
