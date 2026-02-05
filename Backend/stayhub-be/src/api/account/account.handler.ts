import db from "@/database/db.js";
import Account from "./account.js";
import type { NextFunction, Request, Response } from "express";

export async function findAccount(username: string): Promise<Account> {
    const account = await db.oneOrNone("SELECT * FROM accounts WHERE username=$1", username);
    if (!account) throw Error("Account does not exist!");
    return new Account(account);
}

export async function findAccountById(accountid: number): Promise<Account> {
    const account = await db.oneOrNone("SELECT * FROM accounts WHERE id=$1", [accountid]);
    if (!account) throw Error("Account does not exist!");
    return new Account(account);
}