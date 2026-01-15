import type { Request, Response } from "express";
import Hello from "./hello.js";
import { error } from "node:console";

// GET /hello
export async function listName(req: Request, res: Response) {
    try {
        const nameList = await Hello.listName();
        res.json(nameList);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err});
    }
};

// POST /hello
export async function addName(req: Request, res: Response) {
    try {
        const { name } = req.body;
        const result = await Hello.addName(name);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err});
    }
}
