"use client";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { FaAt, FaEye, FaEyeSlash, FaLock, FaRegUser, FaUser } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdEmail } from "react-icons/md";

const RegisterForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstname: "",
    lastname: ""
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus("idle");
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }
      setStatus("success");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message);
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
        Đăng ký tài khoản
      </p>
      {status === "success" && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center text-sm">
          Đăng ký thành công! Đang chuyển hướng...
        </div>
      )}
      {status === "error" && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center text-sm">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="relative">
          <FaRegUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
        </div>
        
        <div className="flex flex-row relative">
          <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="First Name"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />

          </div>
          <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="Last Name"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
          </div>
            
        </div>
        <div className="relative">
          <FaAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          <input
            placeholder="Password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
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
          disabled={status === "loading" || status === "success"}
          className="w-full bg-sky-600 text-white py-4 rounded-lg 
                     font-medium hover:bg-sky-700 transition flex gap-2 justify-center items-center text-lg cursor-pointer"
        >
          {status === "loading" ? (
            "Đang xử lý..."
          ) : (
            <>
              <FiLogIn /> Đăng ký
            </>
          )}
        </button>
      </form>
      <div className="text-center text-sm mt-5">
        <Link
          href={"/login"}
          className="text-sky-700 cursor-pointer flex items-center justify-center"
        >
          <IoIosArrowRoundBack className="text-2xl" />
          <span className="hover:underline">Quay lại đăng nhập</span>
        </Link>
      </div>
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
