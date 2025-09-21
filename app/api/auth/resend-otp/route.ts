// app/api/auth/resend-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { connectToDatabase } from "../../../../lib/mongodb";
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

// Helper function to get user from token
async function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

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
    subject: "New Verification Code - AmbaToBuy",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dda15e, #bc6c25); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Verification Code!</h1>
        </div>
        <div style="padding: 30px; background-color: #fefae0;">
          <h2 style="color: #bc6c25;">Hi ${username}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #606c38;">
            You requested a new verification code. Here's your new code:
          </p>
          <div style="background-color: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; border: 2px solid #dda15e;">
            <h2 style="color: #bc6c25; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h2>
          </div>
          <p style="font-size: 14px; color: #606c38;">
            This code will expire in 15 minutes. If you didn't request this code, please ignore this email.
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
        // ignore and fallback to email lookup
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
          success: false,
          message: "Email is already verified",
        },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new verification code
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          verificationCode,
          verificationExpires,
          updatedAt: new Date(),
        },
      }
    );

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationCode, user.username);
    } catch (emailError) {
      console.error(
        "Failed to send verification email:",
        (emailError as any)?.stack || emailError
      );
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "New verification code sent successfully. Please check your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend OTP error:", (error as any)?.stack || error);
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
