"use client";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { FaAt, FaEye, FaEyeSlash, FaLock, FaRegUser, FaUser } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";

const RegisterForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username: username, firstname: firstname, lastname: lastname, email: email, password: password})
    });
    if (response.status == 200) {
      console.log("Created user successfully!");
      redirect("/login");
    }
  }
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FaRegUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="Username"
            value={username}
            onChange={e=>setUsername(e.target.value)}
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
            value={firstname}
            onChange={e=>setFirstname(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />

          </div>
          <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            placeholder="Last Name"
            value={lastname}
            onChange={e=>setLastname(e.target.value)}
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
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

          <input
            placeholder="Password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
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
