"use client";
import { Loader, MailCheck } from "lucide-react";
import React, {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import LoadingButton from "../helper/LoadingButton";
import { useRouter } from "next/navigation";

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

const Verify = () => {
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);

  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if user is authenticated and get email
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.user) {
          const user = result.data.user;
          setUserEmail(user.email);

          if (user.isVerified) {
            router.replace("/");
          } else {
            setIsPageLoading(false);
          }
        } else {
          router.replace("/auth/login");
        }
      } else if (response.status === 401) {
        // Check if user has temporary token for verification
        const hasAuthToken = document.cookie.includes("auth-token=");
        if (hasAuthToken) {
          // User has token but API returned 401, might be unverified user
          setUserEmail("your email"); // Fallback
          setIsPageLoading(false);
        } else {
          router.replace("/auth/login");
        }
      } else {
        router.replace("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Don't redirect immediately on error, let user try verification
      setIsPageLoading(false);
    }
  };

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = event.target;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Clear errors when user starts typing
      if (error) setError("");

      // Move to next input
      if (value.length === 1 && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoadingState(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ otp: otpValue }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(result.message);
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingState(false);
    }
  };

  const handleResendOTP = async (e: FormEvent) => {
    e.preventDefault();

    if (countdown > 0) return;

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        setCountdown(60); // Start 60 second countdown
        // Clear current OTP
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <Loader className="w-20 h-20 animate-spin text-[#e09f3e]" />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center flex-col justify-center bg-gradient-to-br from-[#fefae0] to-[#faedcd] px-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full ">
        <div className="text-center">
          <MailCheck className="w-20 h-20 sm:w-24 sm:h-24 text-[#e09f3e] mb-6 mx-auto" />

          <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-[#bc6c25]">
            Email Verification
          </h1>

          <p className="mb-6 text-sm sm:text-base text-[#606c38] font-medium">
            We&apos;ve sent a 6-digit code to
          </p>

          <p className="mb-8 text-sm sm:text-base text-[#bc6c25] font-bold break-all">
            {userEmail || "your email"}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* OTP Input */}
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center space-x-2 sm:space-x-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input rounded-lg bg-[#fefae0] border-2 border-[#dda15e] text-lg sm:text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#e09f3e] focus:border-transparent transition-all"
                  value={otp[index] || ""}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onChange={(e) => handleChange(index, e)}
                  disabled={loadingState}
                />
              ))}
            </div>

            <LoadingButton
              size="lg"
              className="w-full mb-4 bg-gradient-to-br from-[#dda15e] to-[#bc6c25] hover:from-[#bc6c25] hover:to-[#dda15e] transition-all duration-300"
              type="submit"
              isLoading={loadingState}
              disabled={loadingState || otp.join("").length !== 6}
            >
              {loadingState ? "Verifying..." : "Verify Email"}
            </LoadingButton>
          </form>

          {/* Resend Code */}
          <div className="flex flex-col items-center justify-center space-x-2 text-sm sm:flex-row sm:text-base">
            <span className="text-[#606c38] font-medium">
              Didn&apos;t receive the code?
            </span>
            <button
              onClick={handleResendOTP}
              disabled={countdown > 0 || resendLoading}
              className={`font-medium underline cursor-pointer transition-colors ${
                countdown > 0 || resendLoading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#e09f3e] hover:text-[#bc6c25]"
              }`}
            >
              {resendLoading
                ? "Sending..."
                : countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend Code"}
            </button>
          </div>

          {/* Back to Login */}
          <p className="mt-6 text-sm text-[#606c38]">
            Wrong email?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-[#e09f3e] hover:text-[#bc6c25] underline font-medium"
            >
              Login with different account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
