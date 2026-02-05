import db from "@/database/db.js";
import type { Request, Response } from "express";

export const getDeals = async (req: Request, res: Response) => {
  try {
    const data = await db.any("SELECT * FROM deals");
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
};