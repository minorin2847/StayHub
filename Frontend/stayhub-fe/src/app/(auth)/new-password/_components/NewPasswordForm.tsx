"use client";
import { auth } from "@/services/auth";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaLock } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { IoIosArrowRoundBack } from "react-icons/io";

const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    content: "",
  });
  if (!token) {
    return (
      <div className="text-red-500 text-sm text-center">
        Đường dẫn không hợp lệ hoặc đã hết hạn
      </div>
    );
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        content: "Mật khẩu xác nhận không khớp",
      });
      return;
    }
    setIsLoading(true);
    try {
      await auth.resetPassword(token, password);
      setMessage({
        type: "success",
        content: "Đổi mật khẩu thành công",
      });
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      setMessage({
        type: error,
        content: error.message || "Lỗi đặt lại mật khẩu.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="text-stone-600">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 shadow-md overflow-hidden">
        <Image
          src={"/images/logo.png"}
          alt="hotel"
          width={500}
          height={500}
          className="w-full h-full object-cover opacity-70"
        />
      </div>
      <h1 className="text-center text-2xxl font-bold">Stayhub</h1>
      <p className="text-center text-gray-500 text-sm mt-1 mb-8">
        Mật khẩu mới
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            name="password"
            placeholder="Nhập mật khẩu mới"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg 
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
            minLength={8}
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          <input
            name="password"
            placeholder="Nhập lại mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-3 border-2 rounded-lg 
                       outline-none focus:ring focus:ring-stone-300
                       border-gray-300 bg-gray-100"
          />
        </div>
        {message.type === "error" && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {message.content}
          </p>
        )}
        <button
          className="w-full bg-sky-600 text-white py-4 rounded-lg 
                     font-medium hover:bg-sky-700 transition flex gap-2 justify-center items-center text-lg cursor-pointer"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
          ) : (
            <>
              <FiLogIn /> Xác nhận đổi mật khẩu
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

export default NewPasswordForm;


// "use client";
// import { auth } from "@/services/auth";
// import Image from "next/image";
// import Link from "next/link";
// import { useSearchParams, useRouter } from "next/navigation";
// import React, { useState } from "react";
// import { FaLock } from "react-icons/fa";
// import { FiLogIn } from "react-icons/fi";
// import { IoIosArrowRoundBack } from "react-icons/io";

// const NewPasswordForm = () => {
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");
//   const router = useRouter();

//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token, newPassword: password }),
//       },
//     );

//     if (res.ok) {
//       alert("Đổi mật khẩu thành công!");
//       router.push("/login");
//     } else {
//       alert("Lỗi: Token hết hạn hoặc không hợp lệ.");
//     }
//   };

//   if (!token) return <div className="text-red-500">Link không hợp lệ!</div>;
//   return (
//     <div className="text-stone-600">
//       <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6 shadow-md overflow-hidden">
//         <Image
//           src={"/images/logo.png"}
//           alt="hotel"
//           width={500}
//           height={500}
//           className="w-full h-full object-cover opacity-70"
//         />
//       </div>
//       <h1 className="text-center text-2xxl font-bold">Stayhub</h1>
//       <p className="text-center text-gray-500 text-sm mt-1 mb-8">
//         Mật khẩu mới
//       </p>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="password"
//           required
//           placeholder="Mật khẩu mới..."
//           className="w-full border p-2 rounded"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button className="w-full bg-blue-600 text-white p-2 rounded">
//           Xác nhận đổi
//         </button>
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

// export default NewPasswordForm;
