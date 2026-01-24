import db from "../../database/db.js";
import { sendResetEmail } from "../../utils/emailSender.js";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "node:crypto";

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await db.oneOrNone("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!user) {
      return res
        .status(200)
        .json({ message: "Nếu email tồn tại, link đã được gửi." });
    }
    await db.none("DELETE FROM password_reset_tokens WHERE email = $1", [
      email,
    ]);

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    await db.none(
      "INSERT INTO password_reset_tokens(email, token, expires_at) VALUES($1, $2, $3)",
      [email, token, expiresAt],
    );

    await sendResetEmail(email, user.username, token);

    return res.status(200).json({ message: "Đã gửi email hướng dẫn!" });
  } catch (error) {
    console.error("Forgot Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const record = await db.oneOrNone(
      "SELECT * FROM password_reset_tokens WHERE token = $1",
      [token],
    );

    if (!record) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc không tồn tại." });
    }

    const now = new Date();
    const expiresAt = new Date(record.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ message: "Token đã hết hạn." });
    }

    const salt = crypto.randomBytes(16);

    crypto.pbkdf2(
      newPassword,
      salt,
      310000,
      32,
      "sha256",
      async (err, hashedPassword) => {
        if (err)
          return res.status(500).json({ message: "Lỗi mã hóa mật khẩu" });

        try {
          await db.none(
            "UPDATE users SET salt = $1, hash = $2 WHERE email = $3",
            [salt, hashedPassword, record.email],
          );

          await db.none("DELETE FROM password_reset_tokens WHERE token = $1", [
            token,
          ]);

          return res.status(200).json({ message: "Đổi mật khẩu thành công!" });
        } catch (dbError) {
          console.error("DB Error:", dbError);
          return res.status(500).json({ message: "Lỗi Database" });
        }
      },
    );
  } catch (error) {
    console.error("Reset Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const register = async (req: Request, res: Response)=>{
  const {username, email, password} = req.body;

  if(!username || !email || !password){
    return res.status(400).json({message: "Vui lòng nhập đủ thông tin!"})
  }
  try {
    const existingUser = await db.oneOrNone(
      "select * from users where email = $1 or username = $2",
      [email, username]
    )
    if(existingUser){
      return res.status(409).json({message: "Email hoặc username đã tồn tại"})
    }
    const salt = crypto.randomBytes(16)
    crypto.pbkdf2(password, salt, 310000, 32, "sha256", async (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: "Lỗi mã hóa mật khẩu" });

      try {
        await db.none(
          "INSERT INTO users(username, email, salt, hash, roles) VALUES ($1, $2, $3, $4, $5)",
          [username, email, salt, hashedPassword, "{ROLE_USER}"]
        );

        return res.status(201).json({ message: "Đăng ký thành công!" });
      } catch (dbError) {
        console.error("DB Error:", dbError);
        return res.status(500).json({ message: "Lỗi lưu Database" });
      }
    });
  } catch (error) {
    console.error('Register Error:', error)
    return res.status(500).json({message: "Lối hệ thống"})
  }
}