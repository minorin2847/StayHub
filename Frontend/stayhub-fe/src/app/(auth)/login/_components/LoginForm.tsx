"use client";
import { auth } from "@/services/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";

const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.username || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setIsLoading(true);
    try {
      await auth.login(formData.username, formData.password);
      console.log("Login success");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

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
        Đăng nhập để tiếp tục
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          <input
            name="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            disabled={isLoading}
            onChange={handleChange}
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
        
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 accent-sky-700" />
            Ghi nhớ đăng nhập
          </label>

          <button 
          onClick={()=>router.push("/forgot-password")}
          type="button" className="text-sky-700 hover:underline cursor-pointer">
            Quên mật khẩu?
          </button>
        </div>
        {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}    
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-sky-600 text-white py-4 rounded-lg 
                     font-medium hover:bg-sky-700 transition flex gap-2 justify-center items-center text-lg cursor-pointer"
        >
          {isLoading ? (
            <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
          ) : (
            <>
              <FiLogIn /> Đăng nhập
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-2">
          <p className="font-bold text-stone-500">Don’t have an account?</p>
          <span
            onClick={() => router.push("/register")}
            className="text-sky-600 font-bold hover:underline cursor-pointer"
          >
            Sign Up
          </span>
        </div>
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

export default LoginForm;
