"use client";
import { auth } from "@/services/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaLock, FaRegUser, FaUser } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdEmail, MdOutlineEmail } from "react-icons/md";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await auth.forgotPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };
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
        Quên mật khẩu
      </p>
      {isSuccess ? (
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
            <MdEmail />
          </div>
          <h3 className="text-xl font-bold text-stone-700">Kiểm tra email</h3>
          <p className="text-stone-500 text-sm mt-2">
            Chúng tôi đã gửi link đặt lại mật khẩu tới <b>{email}</b>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
            <input
              placeholder="Email đăng ký"
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              value={email}
              required
              type="email"
              className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg
                          outline-none focus:ring transition
                          ${
                            error
                              ? "border-red-500 focus:border-red-500 bg-red-50"
                              : "border-gray-300 bg-gray-100 focus:ring-stone-300"
                          }`}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 text-white py-4 rounded-lg 
                         font-medium hover:bg-sky-700 transition flex gap-2 justify-center items-center text-lg cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-4 border-t-stone-500 border-gray-300 rounded-full animate-spin"></div>
            ) : (
              <>
                <FiLogIn /> Gửi yêu cầu
              </>
            )}
          </button>
        </form>
      )}

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

export default ForgotPasswordForm;

//"use client";
// import { auth } from "@/services/auth";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import { FaLock, FaRegUser, FaUser } from "react-icons/fa";
// import { FiLogIn } from "react-icons/fi";
// import { IoIosArrowRoundBack } from "react-icons/io";
// import { MdEmail, MdOutlineEmail } from "react-icons/md";

// const ForgotPasswordForm = () => {
//   const [email, setEmail] = useState("");
//   const [status, setStatus] = useState<
//     "idle" | "loading" | "success" | "error"
//   >("idle");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus("loading");

//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       },
//     );

//     if (res.ok) setStatus("success");
//     else setStatus("error");
//   };

//   if (status === "success") {
//     return (
//       <div className="text-green-600 text-center">
//         Vui lòng kiểm tra email của bạn!
//       </div>
//     );
//   }
//   return (
//     <div className="text-stone-600">
//       <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 shadow-md overflow-hidden">
//         <Image
//           src="/images/logo.png"
//           alt="hotel"
//           width={500}
//           height={500}
//           className="w-full h-full object-cover opacity-70 "
//         />
//       </div>

//       <h1 className="text-center text-2xl font-bold">Stayhub</h1>
//       <p className="text-center text-gray-500 text-sm mt-1 mb-8">
//         Quên mật khẩu
//       </p>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="email"
//           required
//           placeholder="Nhập email..."
//           className="w-full border p-2 rounded"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <button
//           disabled={status === "loading"}
//           className="w-full bg-blue-600 text-white p-2 rounded"
//         >
//           {status === "loading" ? "Đang gửi..." : "Gửi yêu cầu"}
//         </button>
//         {status === "error" && (
//           <p className="text-red-500 text-center">Có lỗi xảy ra.</p>
//         )}
//       </form>

//       <div className="text-center text-sm mt-5">
//         <Link
//           href={"/login"}
//           className="text-sky-700 cursor-pointer flex items-center justify-center"
//         >
//           <IoIosArrowRoundBack className="text-2xl" />
//           <span className="hover:underline">Quay lại đăng nhập</span>
//         </Link>
//       </div>
//       <div className="text-center text-sm mt-5">
//         Cần hỗ trợ?{" "}
//         <span className="text-sky-700 cursor-pointer hover:underline">
//           Liên hệ chúng tôi
//         </span>
//       </div>
//     </div>
//   );
// };

// export default ForgotPasswordForm;
