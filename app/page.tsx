"use client";
import React, { useEffect, useState } from "react";
import { FaRegUserCircle, FaLongArrowAltLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type User = {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
};

interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
}

const page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const apiResponse: ApiResponse = await response.json();

      if (apiResponse.success) {
        setSuccess(apiResponse.message);
        setIsOpenModal(true);
        router.push("/");
      }
    } catch (e) {}
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
      <header className="flex items-center justify-between pl-4 pr-4 h-20 w-full bg-[#fdf0d5] fixed">
        <h1>
          <a href="#" className="text-[#e09f3e] font-bold text-base">
            Tim 9 - AmbaToBuy
          </a>
        </h1>
        <div className="flex">
          <a
            href="#products"
            className="text-[#e09f3e] hidden sm:block font-semibold mr-8"
          >
            Product
          </a>
          <a
            href="#location"
            className="text-[#e09f3e] hidden sm:block font-semibold mr-8"
          >
            Location
          </a>
          <div>
            {/* Checkbox hidden sebagai trigger modal */}
            <input type="checkbox" id="user-modal" className="peer hidden" />

            {/* Icon user */}
            <label htmlFor="user-modal">
              <FaRegUserCircle className="text-[#e09f3e] text-[30px] sm:block font-semibold mr-8 cursor-pointer" />
            </label>

            {/* Modal container */}
            <label
              htmlFor="user-modal"
              className="pointer-events-none invisible fixed flex cursor-pointer items-end justify-center overflow-hidden overscroll-contain opacity-0 transition-all duration-300 ease-in-out peer-checked:pointer-events-auto peer-checked:visible peer-checked:opacity-100 peer-checked:[&>*]:translate-y-0 peer-checked:[&>*]:scale-100 right-0 top-[82px] mr-2"
            >
              {/* Modal content */}
              <label
                htmlFor=""
                className="h-fit w-64 scale-90 overflow-y-auto overscroll-contain rounded-lg bg-[#d4a373] p-6 text-black shadow-2xl transition"
              >
                <h3 className="text-lg font-bold">
                  {user?.username || "Haven't Login yet"}
                </h3>

                <div className="mt-4 flex flex-col gap-2">
                  {user && (
                    <FaLongArrowAltLeft
                      className="cursor-pointer text-md"
                      onClick={logout}
                    />
                  )}
                  {!user && (
                    <Button className="bg-gradient-to-br from-[#dda15e] to-[#bc6c25] pl-5 pr-5 pt-3 pb-3 rounded-full font-bold text-[#fefae0] cursor-pointer">
                      <Link href={"/auth/login"}>Login</Link>
                    </Button>
                  )}
                </div>
              </label>
            </label>
          </div>
        </div>
      </header>

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

      <img
        className="absolute w-10 top-28 left-[10%] rotate-12 sm:w-20 sm:top-32"
        src={"./star.png"}
      />

      <img
        className="absolute w-10 top-[500px] left-[15%] rotate-12 sm:w-20 animate-pulse"
        src={"./star.png"}
      />

      <img
        className="absolute w-10 top-[170px] -rotate-12 animate-bounce sm:top-[280px] sm:w-16 right-[10%]"
        src="./star.png"
      />

      <div className="flex flex-col items-center h-full min-h-screen w-full">
        <h1 className="text-4xl font-bold sm:text-6xl text-transparent bg-clip-text bg-gradient-to-tl from-[#dda15e] to-[#bc6c25] mt-50 sm:mt-70">
          AmbaToBuy
        </h1>
        <p className="text-xl font-bold sm:text-2xl text-transparent bg-clip-text bg-gradient-to-tl from-[#dda15e] to-[#bc6c25] mt-2">
          I'm about to buy it now <span className="text-red-500">🔥🔥</span>
        </p>
        <p className="text-base font-bold sm:text-lg text-[#606c38] text-center pl-8 pr-8 mt-4">
          Nikmati kelezatan makanan dan minuman dengan harga yang ramah di
          kantong
        </p>

        <a
          href="#products"
          className="mt-5 bg-gradient-to-br from-[#dda15e] to-[#bc6c25] pl-5 pr-5 pt-3 pb-3 rounded-full font-bold text-[#fefae0] cursor-pointer"
        >
          Lihat Produk Kami ✨
        </a>

        <div className="flex mt-7 gap-5 sm:gap-10 stagger-bounce">
          <span className="text-[28px] sm:text-[36px]">🍢</span>
          <span className="text-[28px] sm:text-[36px]">🥤</span>
          <span className="text-[28px] sm:text-[36px]">🍣</span>
        </div>
      </div>

      {/* Produk */}
      <div id="products" className="mb-40 scroll-mt-20">
        <h1 className="text-center mb-16 text-4xl font-bold sm:text-6xl text-transparent bg-clip-text bg-gradient-to-tl from-[#dda15e] to-[#bc6c25]">
          Produk Kami
        </h1>

        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Kentang Spiral */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden 
                transform transition duration-300 
                hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src="./kentang-spiral.jpg"
                alt="kentang-spiral"
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#bc6c25]">
                  Kentang Spiral
                </h3>
                <h2 className="text-[#606c38] font-bold">
                  Rp 5.000 - Rp 10.000
                </h2>
              </div>
            </div>

            {/* Sushi */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden 
                transform transition duration-300 
                hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src="./Sushi.png"
                alt="sushi"
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#bc6c25]">Sushi</h3>
                <h2 className="text-[#606c38] font-bold">Rp 2.000/each</h2>
              </div>
            </div>

            {/* Jasuke */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden 
                transform transition duration-300 
                hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src="./jasuke.jpg"
                alt="jasuke"
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#bc6c25]">Jasuke</h3>
                <h2 className="text-[#606c38] font-bold">Rp 5.000</h2>
              </div>
            </div>

            {/* Es Milo */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden 
                transform transition duration-300 
                hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src="./milo.jpg"
                alt="milo"
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#bc6c25]">
                  Es Milo
                </h3>
                <h2 className="text-[#606c38] font-bold">Rp 5.000</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lokasi Sekolah */}
      <div id="location" className="mb-40 scroll-mt-20">
        <h1 className="text-center mb-8 text-4xl font-bold sm:text-6xl text-transparent bg-clip-text bg-gradient-to-tl from-[#dda15e] to-[#bc6c25]">
          Lokasi Sekolah Kami
        </h1>
        <div className="container mx-auto px-4 sm:px-8">
          <div className="rounded-xl overflow-hidden shadow-lg border-4 border-[#dda15e]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.505226940615!2d104.01104707473082!3d1.1370523991090188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d9896d4a26327b%3A0x7337ffa630e19736!2sSMP%20Advent%20Batam!5e0!3m2!1sen!2sid!4v1726827593706!5m2!1sen!2sid"
              width="100%"
              height="400"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-[#ffe8ba] py-6 text-center">
        <p className="text-[#606c38] font-semibold">
          Web ini dibuat oleh{" "}
          <span className="text-[#bc6c25]">AmbaToBuy - Tim 9</span>
        </p>
        <a
          href="https://www.instagram.com/danny_env/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e09f3e] hover:underline font-bold"
        >
          @danny_env & Teams
        </a>
      </footer>
    </div>
  );
};

export default page;
