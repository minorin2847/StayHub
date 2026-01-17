import { passport } from '@/utils/initializeSession.js';
import db from '@/database/db.js';
import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';

import User from "@/api/user/user.js";
import type { UserRole } from '@/api/user/user.enum.js';
export function login(redirectSuccess: string, redirectFailed: string) {
    return passport.authenticate('local', {
        successRedirect: redirectSuccess,
        successMessage: "Login successful",
        failureRedirect: redirectFailed,
        failureMessage: "Incorrect username or password"
    })
}

export function logout(req: Request, res: Response, next: NextFunction) {
    req.logout(err => {
        if (err) return next(err);
        res.redirect("/");
    })
}

export function isLoggedIn(redirectTo: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user) {
            next()
        }
        res.redirect(redirectTo);
    }
}

export function checkRole(roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as User;
        const userRoles = user.roles;
        for (const role of userRoles) {
            if (roles.includes(role)) {
                next();
            }
        }
        res.status(401).send("User unauthorized").redirect("/");
    }
}

export function signUp(req: Request, res: Response, next: NextFunction) {
    const salt = crypto.randomBytes(16);
    const { username, password } = req.body;
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashed) => {
        if (err) return next(err);
        db.one("INSERT INTO users(username, salt, hash) VALUES ($1, $2, $3) RETURNING id, username", [username, salt, hashed])
        .then(row => {
            req.login({id: row.id, username: row.username}, err => {
                if (err) return next(err);
                res.redirect("/");
            })
        })
    })
}
