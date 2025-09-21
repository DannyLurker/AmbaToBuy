// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcryptjs from "bcryptjs";
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

export async function POST(request: NextRequest) {
  let client;

  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    // Connect to database
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Find user by email
    const user = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      // Still generate token so user can access verify page
      const tempToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username,
          isVerified: false,
        },
        JWT_SECRET,
        { expiresIn: "1h" } // Temporary token for verification
      );

      const response = NextResponse.json(
        {
          success: false,
          message: "Please verify your email before logging in",
          needsVerification: true,
        },
        { status: 403 }
      );

      // Set temporary cookie for verification
      response.cookies.set("auth-token", tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      return response;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id, // MongoDB _id field, bukan insertedId
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
        message: "Login successful",
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

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
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
