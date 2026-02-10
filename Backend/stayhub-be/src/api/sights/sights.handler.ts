import db from "@/database/db.js";
import type { Request, Response } from "express";

export const getTopSights = async (req: Request, res: Response) => {
  try {
    const data = await db.any("select * from top_sights order by id asc");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};
