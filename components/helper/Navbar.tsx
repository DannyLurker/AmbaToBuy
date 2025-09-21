import React, { useState } from "react";
import { FaRegUserCircle, FaLongArrowAltLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";

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

const Navbar = ({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="bg-[#fdf0d5] fixed w-full top-0 z-50 shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center align-middle">
          {/* Logo */}
          <a className="text-[#e09f3e] font-bold text-lg" href="#">
            Tim 9 - AmbaToBuy
          </a>

          <div className="flex gap-4 mt-1">
            <nav className="hidden sm:flex space-x-6">
              <a
                href="#products"
                className="text-gray-700 hover:text-[#e09f3e] font-semibold"
              >
                Products
              </a>
              <a
                href="#location"
                className="text-gray-700 hover:text-[#e09f3e] font-semibold"
              >
                Location
              </a>
              <Link
                href="#"
                className="text-gray-700 hover:text-[#e09f3e] font-semibold"
              >
                Pre-Order
              </Link>
            </nav>

            <div className="flex align-middle gap-5 ml-8">
              <div className="sm:hidden mt-2">
                <button
                  className="sm:hidden text-[#e09f3e] text-2xl"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>

              {/* Checkbox hidden sebagai trigger modal */}
              <input type="checkbox" id="user-modal" className="peer hidden" />

              {/* Icon user (desktop & mobile share sama id) */}
              <label htmlFor="user-modal">
                <FaRegUserCircle className="text-[#e09f3e] text-[30px] sm:block font-semibold mr-8 cursor-pointer mt-1 sm:mt-0" />
              </label>

              {/* Modal container */}
              <label
                htmlFor="user-modal"
                className="pointer-events-none invisible fixed flex cursor-pointer items-end justify-center 
    opacity-0 transition-all duration-300 ease-in-out
    peer-checked:pointer-events-auto peer-checked:visible peer-checked:opacity-100 
    peer-checked:[&>*]:translate-y-0 peer-checked:[&>*]:scale-100 md:right-[5%] lg:right-[8%] right-0 top-[82px] mr-2"
              >
                <label
                  htmlFor=""
                  className="h-fit w-64 scale-90 overflow-y-auto rounded-lg bg-[#d4a373] p-6 text-black shadow-2xl transition"
                >
                  <h3 className="text-lg font-bold">
                    {user?.username || "Haven't Login yet"}
                  </h3>

                  <div className="mt-4 flex flex-col gap-2">
                    {user && (
                      <FaLongArrowAltLeft
                        className="cursor-pointer text-md"
                        onClick={onLogout}
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
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className={
            isOpen
              ? "left-[0%] top-[100%] absolute md:static bg-[#fdf0d5] md:bg-transparent min-h-[92vh] md:min-h-0 md:top-0 w-[60%] md:w-auto items-start md:items-center px-5 md:px-0 flex flex-col md:flex-row gap-8 md:gap-[4vw] z-10 transition- duration-500 sm:hidden"
              : "sm:hidden  left-[-100%] top-[100%] absolute md:static bg-[#fdf0d5] md:bg-transparent min-h-[92vh] md:min-h-0 md:top-0 w-[60%] md:w-auto items-start md:items-center px-5 md:px-0 flex flex-col md:flex-row gap-8 md:gap-[4vw] transition duration-500"
          }
        >
          <a
            href="#"
            className="block text-gray-700 hover:text-[#e09f3e] font-semibold"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="block text-gray-700 hover:text-[#e09f3e] font-semibold"
          >
            Team
          </a>
          <Link
            href="#"
            className="block text-gray-700 hover:text-[#e09f3e] font-semibold"
          >
            Pre-Order
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
