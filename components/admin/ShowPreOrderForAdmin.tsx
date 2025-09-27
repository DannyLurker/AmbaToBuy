"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/helper/Navbar";
import { X } from "lucide-react";
import { Footer } from "@/components/helper/Footer";

const ShowPreOrderForAdmin = () => {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    const checkUserAuth = async () => {
      setAuthLoading(true);
      setAuthError("");

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Auth check response:", data); // Debug log

        if (data?.success && data?.data?.user && data.data.user.id) {
          setIsAuthenticated(true);
          setUser(data.data.user);
          // Auto-fill nama jika tersedia dari user data
          if (data.data.user.username && !nama) {
            setNama(data.data.user.username);
          }
        } else {
          console.log("Auth failed:", data); // Debug log
          setIsAuthenticated(false);
          setAuthError("Session tidak valid. Silakan login kembali.");
          // Delay redirect untuk memberi waktu user membaca pesan
          setTimeout(() => {
            router.push(
              "/auth/login?redirect=" +
                encodeURIComponent(window.location.pathname)
            );
          }, 2000);
        }
      } catch (error: any) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setAuthError("Gagal memverifikasi session. Silakan login.");

        // Handle different error scenarios
        if (error.message.includes("401") || error.message.includes("403")) {
          setTimeout(() => {
            router.push(
              "/auth/login?redirect=" +
                encodeURIComponent(window.location.pathname)
            );
          }, 2000);
        } else {
          // Network atau server error
          setTimeout(() => {
            router.push(
              "/auth/login?error=connection&redirect=" +
                encodeURIComponent(window.location.pathname)
            );
          }, 3000);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    checkUserAuth();

    // Set up periodic auth check (setiap 2 menit untuk lebih responsif)
    const authInterval = setInterval(checkUserAuth, 2 * 60 * 1000);

    return () => clearInterval(authInterval);
  }, [router]);

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setIsOpenModal(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#dda15e] mb-4"></div>
          <p className="text-[#606c38] font-semibold">
            Memverifikasi session...
          </p>
          <p className="text-[#606c38] text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (
    process.env.NEXT_PUBLIC_PRE_ORDER_FORM_STATUS === "private" &&
    !(user.role === "admin")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#606c38] mb-4">
            Akses Ditolak
          </h2>
          <p className="text-[#606c38] mb-6">Anda tidak memiliki aksesnya</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-[#fefae0] to-[#faedcd] relative">
      <Navbar user={user} onLogout={logout} />

      {isOpenModal && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{success}</span>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ShowPreOrderForAdmin;
