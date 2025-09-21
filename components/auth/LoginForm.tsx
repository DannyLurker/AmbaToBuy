"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import PasswordInput from "../helper/PasswordInput";
import Link from "next/link";
import LoadingButton from "../helper/LoadingButton";
import { useRouter } from "next/navigation";

interface FormData {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      isVerified: boolean;
    };
  };
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify(formData),
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.log("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setSuccess(result.message);
        // Redirect to dashboard/home after successful login
        setTimeout(() => {
          router.push("/"); // or "/dashboard"
        }, 1500);
      } else if (result.status === 403) {
        console.log("test result.status:", result.status);
        setTimeout(() => {
          router.push("/auth/verify-email");
        }, 1500);
        setError(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
      <div className="w-full h-full flex justify-center">
        <div className="w-[330px] sm:w-[450px] md:w-[600px]">
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="font-bold text-xl sm:text-2xl text-center uppercase mb-8">
              Login To <span className="text-[#e09f3e]">AmbaToBuy</span>
            </h1>

            {/* Error Message */}
            {error && (
              <div className="w-[90%] sm:w-[80%] md:w-[90%] lg:w-[90%] xl:w-[80%] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="w-[90%] sm:w-[80%] md:w-[90%] lg:w-[90%] xl:w-[80%] mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <form
              className="block w-[90%] sm:w-[80%] md:w-[90%] lg:w-[90%] xl:w-[80%]"
              onSubmit={handleSubmit}
            >
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="font-semibold mb-2 block text-[#606c38]"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email address"
                  className="px-4 py-3 bg-white border border-[#dda15e] rounded-lg w-full block outline-none focus:ring-2 focus:ring-[#e09f3e] focus:border-transparent"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6">
                <PasswordInput
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  inputClassName="px-4 py-3 bg-white border border-[#dda15e] rounded-lg w-full block outline-none focus:ring-2 focus:ring-[#e09f3e] focus:border-transparent"
                />
              </div>

              <LoadingButton
                size={"lg"}
                className="w-full mt-3 bg-gradient-to-br from-[#dda15e] to-[#bc6c25] hover:from-[#bc6c25] hover:to-[#dda15e] transition-all duration-300"
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </LoadingButton>
            </form>

            <p className="mt-6 text-lg text-[#606c38] text-center">
              Don&apos;t have an account yet?{" "}
              <Link href={"/auth/signup"}>
                <span className="text-[#e09f3e] hover:text-[#bc6c25] underline cursor-pointer font-bold">
                  Create an account
                </span>
              </Link>
            </p>

            {/* Optional: Forgot Password Link */}
            <p className="mt-2 text-sm text-[#606c38] text-center">
              <Link href={"/auth/forgot-password"}>
                <span className="text-[#dda15e] hover:text-[#bc6c25] underline cursor-pointer">
                  Forgot your password?
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
