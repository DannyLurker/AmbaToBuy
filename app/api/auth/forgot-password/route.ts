// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { sanitizeAuthInput } from "../../../../lib/sanitize";
import nodemailer from "nodemailer";

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

// Helper function to generate reset token
function generateResetToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to send password reset email
async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
) {
  const transporter = nodemailer.createTransport(EMAIL_CONFIG);

  const resetUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@ambatobuy.com",
    to: email,
    subject: "Password Reset Request - AmbaToBuy",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dda15e, #bc6c25); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background-color: #fefae0;">
          <h2 style="color: #bc6c25;">Hi ${username}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #606c38;">
            We received a request to reset your password. Use the code below to reset your password:
          </p>
          <div style="background-color: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; border: 2px solid #dda15e;">
            <h2 style="color: #bc6c25; font-size: 32px; margin: 0; letter-spacing: 5px;">${token}</h2>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #606c38;">
            Or click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #dda15e, #bc6c25); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #606c38;">
            This reset code will expire in 1 hour. If you didn't request this reset, please ignore this email.
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

    // Sanitize input to prevent NoSQL injection
    const { email } = sanitizeAuthInput(body);

    // Validation
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
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

    // Find user by email - now safe from NoSQL injection
    const user = await db.collection("users").findOne({
      email, // already sanitized
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account with that email exists, we've sent a password reset link.",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires,
          updatedAt: new Date(),
        },
      }
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.username);
    } catch (emailError) {
      console.error(
        "Failed to send password reset email:",
        (emailError as any)?.stack || emailError
      );
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send reset email. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", (error as any)?.stack || error);
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
