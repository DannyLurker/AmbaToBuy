// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { connectToDatabase } from "../../../../lib/mongodb";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ambatobuy";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

// ...using centralized `connectToDatabase` from `lib/mongodb`

// Helper function to generate verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to send verification email
async function sendVerificationEmail(
  email: string,
  code: string,
  username: string
) {
  const transporter = nodemailer.createTransport(EMAIL_CONFIG);

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@ambatobuy.com",
    to: email,
    subject: "Verify Your Email - AmbaToBuy",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dda15e, #bc6c25); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to AmbaToBuy!</h1>
        </div>
        <div style="padding: 30px; background-color: #fefae0;">
          <h2 style="color: #bc6c25;">Hi ${username}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #606c38;">
            Thank you for signing up! Please verify your email address using the code below:
          </p>
          <div style="background-color: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; border: 2px solid #dda15e;">
            <h2 style="color: #bc6c25; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h2>
          </div>
          <p style="font-size: 14px; color: #606c38;">
            This code will expire in 15 minutes. If you didn't create an account, please ignore this email.
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #bc6c25; font-weight: bold;">
              🍢🥤🍣 I'm about to buy it now 🔥🔥
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: NextRequest) {
  let client;

  try {
    const body = await request.json();
    const { username, email, password, passwordConfirm } = body;

    // Validation
    if (!username || !email || !password || !passwordConfirm) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
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

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return NextResponse.json(
        {
          success: false,
          message: `User with this ${field} already exists`,
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const newUser = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, username);
    } catch (emailError) {
      console.error(
        "Failed to send verification email:",
        (emailError as any)?.stack || emailError
      );
      // Don't fail the registration if email fails
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: email.toLowerCase(),
        username,
        isVerified: false,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message:
          "User registered successfully. Please check your email for verification code.",
        data: {
          user: {
            id: result.insertedId,
            username,
            email: email.toLowerCase(),
            isVerified: false,
            createdAt: newUser.createdAt,
          },
        },
      },
      { status: 201 }
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
    console.error("Signup error:", (error as any)?.stack || error);
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
