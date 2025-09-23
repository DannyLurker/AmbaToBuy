"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/helper/Navbar";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import ShowPreOrder from "@/components/pre-order/ShowPreOrder";

type User = {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
};

const page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const router = useRouter();

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

  // ambil user saat komponen mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    getUser();
  }, []);
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

      <ShowPreOrder />
    </div>
  );
};

export default page;
