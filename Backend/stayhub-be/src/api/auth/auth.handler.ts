import { passport } from "@/utils/initializeSession.js";
import type { NextFunction, Request, Response } from "express";

import type User from "@/api/user/user.js";
import { findUser, findUserByUsername } from "@/api/user/user.handler.js";
import db from "../../database/db.js";
import { sendResetEmail } from "../../utils/emailSender.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "node:crypto";

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const account = await db.oneOrNone("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!account) {
      return res
        .status(200)
        .json({ message: "Nếu email tồn tại, link đã được gửi." });
    }
    await db.none("DELETE FROM passwordResetTokens WHERE email = $1", [email]);

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.none(
      "INSERT INTO passwordResetTokens(email, token, expiresAt) VALUES($1, $2, $3)",
      [email, token, expiresAt],
    );
    const user = await findUser(account.id);
    await sendResetEmail(email, user.firstname, user.lastname, token);

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
      "SELECT * FROM passwordResetTokens WHERE token = $1",
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

          await db.none("DELETE FROM passwordResetTokens WHERE token = $1", [
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

export function login(req: Request, res: Response, next: NextFunction) {
  return passport.authenticate(
    "user-login",
    (err: any, user: any, info: any, status: any) => {
      if (err) return next(err);
      if (!user) res.status(404).send("Incorrect username or password!");
      findUser(user.id)
        .then(() => {
          req.login(user, (err) => {
            if (err) return next(err);
            res.status(200).send("Login successful!");
          });
        })
        .catch(() => res.status(404).send("Incorrect username or password!"));
    },
  )(req, res, next);
}

export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).send("Logout successful!");
  });
}

export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
    return;
  } else {
    res.status(401).send("Unauthorized!");
  }
}

// export function checkRole(roles: UserRole[]) {
//     return (req: Request, res: Response, next: NextFunction) => {
//         const user = req.user as User;
//         const userRoles = user.roles;
//         for (const role of userRoles) {
//             if (roles.includes(role)) {
//                 next();
//             }
//         }
//         res.status(401).send("User unauthorized");
//     }
// }

export function signUp(req: Request, res: Response, next: NextFunction) {
  const salt = crypto.randomBytes(16);
  const { username, password, firstname, lastname, email } = req.body;
  if (!firstname || !username || !email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
  }
  findUserByUsername(username)
    .then(() => res.status(409).send("User already exists!"))
    .catch(() => {
      crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, hashed) => {
        if (err) return next(err);
        db.task("sign-up", async (t) => {
          const userAccount = await db.one(
            "INSERT INTO users(username, salt, hash, email, firstName, lastName)\
                    VALUES ($(username), $(salt), $(hash), $(email), $(firstName), $(lastName)) \
                    RETURNING id, username, email, firstName, lastName",
            {
              username: username,
              salt: salt,
              hash: hashed,
              email: email,
              firstName: firstname,
              lastName: lastname,
            },
          );
          console.log(
            `Created account ${firstname} ${lastname} (${username}), ID ${userAccount.id} with email ${email}!`,
          );
        }).then(() => {
          res.status(200).send("Signed up successful!");
        });
      });
    });
}
