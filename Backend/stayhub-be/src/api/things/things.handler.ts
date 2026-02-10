import db from "@/database/db.js";
import type { Request, Response } from "express";

export const getThingsToDo = async (req: Request, res: Response) => {
  try {
    const { category } = req.body;
    let query = "Select * from things_to_do";
    let params: any[] = [];
    if (category) {
      query += " where category = $1";
      params.push(category);
    } else {
      query += " where category = 'explore'";
    }
    const data = await db.any(query, params);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};
