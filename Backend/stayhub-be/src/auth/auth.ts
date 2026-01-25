import { passport } from '@/utils/initializeSession.js';
import db from '@/database/db.js';
import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';

import User from "@/api/user/user.js";
import { findUser } from '@/api/user/user.handler.js';
import { findAccount } from '@/api/account/account.handler.js';
export function login(req: Request, res: Response, next: NextFunction) {
    return passport.authenticate('local', (err: any, user: any, info: any, status: any) => {
        if (err) return next(err);
        if (!user) res.status(404).send("Incorrect username or password!");
        findUser(user.id).then(() => {
            req.login(user, err => {
                if (err) return next(err);
                res.status(200).send("Login successful!");
            });
        }).catch(() => res.status(404).send("Incorrect username or password!"))

    })(req, res, next)
}

export function logout(req: Request, res: Response, next: NextFunction) {
    req.logout(err => {
        if (err) return next(err);
        res.status(200).send("Logout successful!");
    })
}

export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
    if (req.user) {
        next()
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
    if(!firstname || !username || !email || !password){
    return res.status(400).json({message: "Vui lòng nhập đủ thông tin!"})
  }
    findAccount(username).then(() => res.status(409).send("User already exists!")).catch(() => {
        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashed) => {
            if (err) return next(err);
            db.task('sign-up', async t => {
                const userAccount = await db.one("INSERT INTO accounts(username, salt, hash, email)\
                    VALUES ($(username), $(salt), $(hash), $(email)) \
                    RETURNING id, username, email", {
                        username: username,
                        salt: salt,
                        hash: hashed,
                        email: email
                    });
                console.log(`Created account ${username}, ID ${userAccount.id} with email ${email}!`);
                const user = await db.one("INSERT INTO users(accountID, firstName, lastName) \
                    VALUES ($(accountID), $(firstName), $(lastName))    \
                    RETURNING id", {
                        accountID: userAccount.id,
                        firstName: firstname,
                        lastName: lastname
                    });
                console.log(`Created user account with id ${user.id}!`);
            }).then(() => {
                    res.status(200).send("Signed up successful!");
            });
        })
    })

}
