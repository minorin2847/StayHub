import { passport } from '@/utils/initializeSession.js';
import db from '@/database/db.js';
import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';

import User from "@/api/user/user.js";
import type { UserRole } from '@/api/user/user.enum.js';
export function login(req: Request, res: Response, next: NextFunction) {
    return passport.authenticate('local', (err: any, user: any, info: any, status: any) => {
        if (err) return next(err);
        if (!user) res.status(404).send("Incorrect username or password!");
        req.login(user, err => {
            if (err) return next(err);
            res.status(200).send("Login successful!");
        });
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

export function checkRole(roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as User;
        const userRoles = user.roles;
        for (const role of userRoles) {
            if (roles.includes(role)) {
                next();
            }
        }
        res.status(401).send("User unauthorized");
    }
}

export function signUp(req: Request, res: Response, next: NextFunction) {
    const salt = crypto.randomBytes(16);
    const { username, password, name, email } = req.body;
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashed) => {
        if (err) return next(err);
        db.one("INSERT INTO users(username, salt, hash, name, email) VALUES ($1, $2, $3, $4, $5)", [username, salt, hashed, name, email])
        .then(row => {
            req.login({id: row.id, username: username, name: name, email: email}, err => {
                if (err) return next(err);
                res.status(200).send("Signed up successful!");
            })
        })
    })
}
