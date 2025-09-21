"use client";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import PasswordInput from "../helper/PasswordInput";
import Link from "next/link";
import LoadingButton from "../helper/LoadingButton";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, CheckCircle } from "lucide-react";

interface FormData {
  token: string;
  password: string;
  passwordConfirm: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      isVerified: boolean;
    };
  };
}

const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    token: "",
    password: "",
    passwordConfirm: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token from URL params
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setFormData((prev) => ({ ...prev, token: tokenFromUrl }));
    }
  }, [searchParams]);

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

    // Client-side validation
    if (!formData.token.trim()) {
      setError("Reset code is required");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
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
        setIsSuccess(true);
        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <div className="w-full h-full flex justify-center">
          <div className="w-[330px] sm:w-[450px] md:w-[500px]">
            <div className="flex flex-col items-center justify-center h-screen">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full text-center">
                <CheckCircle className="w-20 h-20 text-green-500 mb-6 mx-auto" />

                <h1 className="font-bold text-2xl sm:text-3xl text-[#bc6c25] mb-4">
                  Password Reset Successfully!
                </h1>

                <p className="text-[#606c38] mb-6 leading-relaxed">
                  Your password has been updated. You are now logged in and will
                  be redirected to the homepage.
                </p>

                <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  {success}
                </div>

                <div className="space-y-4">
                  <LoadingButton
                    size="lg"
                    className="w-full bg-gradient-to-br from-[#dda15e] to-[#bc6c25] hover:from-[#bc6c25] hover:to-[#dda15e] transition-all duration-300"
                    onClick={() => router.push("/")}
                    isLoading={false}
                  >
                    Go to Homepage
                  </LoadingButton>

                  <p className="text-sm text-[#606c38]">
                    Redirecting automatically in 3 seconds...
                  </p>
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
                <KeyRound className="w-16 h-16 text-[#e09f3e] mb-4 mx-auto" />
                <h1 className="font-bold text-2xl sm:text-3xl text-[#bc6c25] mb-2">
                  Reset Your Password
                </h1>
                <p className="text-[#606c38]">
                  Enter your new password below to reset your account.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="token"
                    className="font-semibold mb-2 block text-[#606c38]"
                  >
                    Reset Code
                  </label>
                  <input
                    type="text"
                    name="token"
                    id="token"
                    placeholder="Enter 6-digit reset code"
                    className="px-4 py-3 bg-[#fefae0] border-2 border-[#dda15e] rounded-lg w-full block outline-none focus:ring-2 focus:ring-[#e09f3e] focus:border-transparent transition-all"
                    value={formData.token}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <p className="text-xs text-[#606c38] mt-1">
                    Check your email for the 6-digit reset code
                  </p>
                </div>

                <div className="mb-4">
                  <PasswordInput
                    label="New Password"
                    name="password"
                    placeholder="Enter new password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    inputClassName="px-4 py-3 bg-[#fefae0] border-2 border-[#dda15e] rounded-lg w-full block outline-none focus:ring-2 focus:ring-[#e09f3e] focus:border-transparent transition-all"
                  />
                </div>

                <div className="mb-6">
                  <PasswordInput
                    label="Confirm New Password"
                    name="passwordConfirm"
                    placeholder="Confirm your new password"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    disabled={isLoading}
                    inputClassName="px-4 py-3 bg-[#fefae0] border-2 border-[#dda15e] rounded-lg w-full block outline-none focus:ring-2 focus:ring-[#e09f3e] focus:border-transparent transition-all"
                  />
                </div>

                <LoadingButton
                  size="lg"
                  className="w-full mb-6 bg-gradient-to-br from-[#dda15e] to-[#bc6c25] hover:from-[#bc6c25] hover:to-[#dda15e] transition-all duration-300"
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </LoadingButton>

                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-[#606c38]">
                      Remember your password?
                    </span>
                    <Link
                      href="/auth/login"
                      className="text-sm font-medium text-[#bc6c25] hover:text-[#e09f3e] transition-colors duration-200"
                    >
                      Sign in
                    </Link>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-[#606c38]">
                      Need a new reset code?
                    </span>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-[#bc6c25] hover:text-[#e09f3e] transition-colors duration-200"
                    >
                      Request new code
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
