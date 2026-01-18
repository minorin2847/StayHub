"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaAt, FaEye, FaEyeSlash, FaLock, FaRegUser, FaUser } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";

const RegisterForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);
  return (
    <div className="text-stone-600">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 shadow-md overflow-hidden">
        <Image
          src="/images/logo.png"
          alt="hotel"
          width={500}
          height={500}
          className="w-full h-full object-cover opacity-70 "
        />
      </div>

      <h1 className="text-center text-2xl font-bold">Stayhub</h1>
      <p className="text-center text-gray-500 text-sm mt-1 mb-8">
        Đăng ký tài khoản
      </p>

      <form className="space-y-4">
        <div className="relative">
          <FaRegUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="Username"
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
        </div>
        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="Name"
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
        </div>
        <div className="relative">
          <FaAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="Email"
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          <input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg 
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                       text-gray-600 hover:text-black transition"
          >
            {showPassword ? (
              <FaEyeSlash className="text-lg" />
            ) : (
              <FaEye className="text-lg" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-sky-600 text-white py-4 rounded-lg 
                     font-medium hover:bg-sky-700 transition flex gap-2 justify-center items-center text-lg cursor-pointer"
        >
          <FiLogIn />
          Đăng ký
        </button>
      </form>

      <div className="text-center text-sm mt-5">
        Cần hỗ trợ?{" "}
        <span className="text-sky-700 cursor-pointer hover:underline">
          Liên hệ chúng tôi
        </span>
      </div>
    </div>
  );
};

export default RegisterForm;
