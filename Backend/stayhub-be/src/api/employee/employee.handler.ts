import db from "@/database/db.js";
import { passport } from "@/utils/initializeSession.js";
import type { NextFunction, Request, Response } from "express";
import type { CreateEmployeeInput } from "./employee.type.js";
import crypto from "node:crypto";
import type Employee from "./employee.js";



export async function findEmployeeByUsername(username: string): Promise<Employee> {
  const employee = await db.oneOrNone("SELECT * FROM get_user_auth_context($1)", [
    username,
  ]);
  if (!employee) {
    throw Error(`Can't find employee with username ${username}!`);
  }
  return employee as Employee;
}

export function login(req: Request, res: Response, next: NextFunction) {
  return passport.authenticate(
    "employee-login",
    (err: any, user: any, info: any, status: any) => {
      if (err) return next(err);
      if (!user) res.status(404).send("Incorrect username or password!");
      findEmployeeByUsername(user.username)
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


export function createEmployee(req: Request, res: Response, next: NextFunction) {
    const salt = crypto.randomBytes(16);
    const { username, password, firstname, lastname, email, roles, hotelid, branchid } = req.body;
    if(!firstname || !username || !email || !password){
    return res.status(400).json({message: "Vui lòng nhập đủ thông tin!"})
  }
    findEmployeeByUsername(username).then(() => res.status(409).send("Employee already exists!")).catch(() => {
        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashed) => {
            if (err) return next(err);
            db.task('sign-up', async t => {
              await t.none("SET LOCAL app.current_username = $1", [req.user.username]);
              await t.none("SET LOCAL app.roles = $1", [req.user.roles]);
              await t.none("SET LOCAL app.hotelid = $1", [req.user.hotelid || '']);
              await t.none("SET LOCAL app.branchid = $1", [req.user.branchid || '']);
                const userAccount = await db.one("INSERT INTO employees(username, salt, hash, email, firstName, lastName, hotelid, branchid)\
                    VALUES ($(username), $(salt), $(hash), $(email), $(firstName), $(lastName), $(hotelid), $(branchid)) \
                    RETURNING id, username, email, firstName, lastName, hotelid, branchid", {
                        username: username,
                        salt: salt,
                        hash: hashed,
                        email: email,
                        firstName: firstname,
                        lastName: lastname,
                        hotelid: hotelid,
                        branchid: branchid
                    });
                console.log(`Created account ${firstname} ${lastname} (${username}), ID ${userAccount.id} with email ${email}!`);
            }).then(() => {
                    res.status(200).send("Signed up successful!");
            });
        })
    })

}