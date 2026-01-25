import React from "react";

export const auth = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }
    return await res.json();
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        data.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.",
      );
    }
    return await res.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw Error(data.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    }
    return await res.json();
  },
};
