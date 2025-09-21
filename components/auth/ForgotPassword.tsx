"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import LoadingButton from "../helper/LoadingButton";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";

interface FormData {
  email: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setSuccess(result.message);
        setIsEmailSent(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setSuccess("Reset email sent again. Please check your inbox.");
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Resend email error:", err);
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <div className="w-full h-full flex justify-center">
          <div className="w-[330px] sm:w-[450px] md:w-[500px]">
            <div className="flex flex-col items-center justify-center h-screen">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full">
                <div className="text-center">
                  <Mail className="w-20 h-20 text-[#e09f3e] mb-6 mx-auto" />

                  <h1 className="font-bold text-2xl sm:text-3xl text-[#bc6c25] mb-4">
                    Check Your Email
                  </h1>

                  <p className="text-[#606c38] mb-6 leading-relaxed">
                    We've sent password reset instructions to{" "}
                    <span className="font-semibold text-[#bc6c25] break-all">
                      {formData.email}
                    </span>
                  </p>

                  {/* Success Message */}
                  {success && (
                    <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-sm text-[#606c38]">
                      Didn't receive the email? Check your spam folder or
                    </p>

                    <button
                      onClick={handleResendEmail}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                        isLoading
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#fefae0] border-2 border-[#dda15e] text-[#bc6c25] hover:bg-[#dda15e] hover:text-white"
                      }`}
                    >
                      {isLoading ? "Sending..." : "Resend Email"}
                    </button>

                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-2 text-[#e09f3e] hover:text-[#bc6c25] font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
      <div className="w-full h-full flex justify-center">
        <div className="w-[330px] sm:w-[450px] md:w-[500px]">
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full">
              <div className="text-center mb-8">
                <Mail className="w-16 h-16 text-[#e09f3e] mb-4 mx-auto" />
                <h1 className="font-bold text-2xl sm:text-3xl text-[#bc6c25] mb-2">
                  Forgot Password?
                </h1>
                <p className="text-[#606c38]">
                  No worries! Enter your email and we'll send you reset
                  instructions.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="font-semibold mb-2 block text-[#606c38]"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email address"
                    className="px-4 py-3 bg-[#fefae0] border-2 border-[#dda15e] rounded-lg w-full block outline-none focus:ring-2 focus:ring-[#e09f3e] focus:border-transparent transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <LoadingButton
                  size="lg"
                  className="w-full mb-6 bg-gradient-to-br from-[#dda15e] to-[#bc6c25] hover:from-[#bc6c25] hover:to-[#dda15e] transition-all duration-300"
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </LoadingButton>
              </form>

              <div className="text-center space-y-4">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 text-[#e09f3e] hover:text-[#bc6c25] font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>

                <p className="text-sm text-[#606c38]">
                  Don't have an account?{" "}
                  <Link href="/auth/signup">
                    <span className="text-[#e09f3e] hover:text-[#bc6c25] underline font-semibold">
                      Sign up here
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
