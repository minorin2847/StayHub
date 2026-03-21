import db from "@/database/db.js"
import type { Request, Response } from "express";

export const getAllEmployee = async (req: Request, res: Response) => {
  try {
    const users = await db.any(`SELECT * FROM employees
      `)
      res.status(200).json({
        success: true,
        data: users
      })
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }   
}


export const createBranchManager = async (req: Request, res: Response) =>{
  try {
    const {username, password, firstname, lastname, email, branch_id} = req.body;
    const user = await db.one(`INSERT INTO emp (username, hash , firstname, lastname, email, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [username, password, firstname, lastname, email, "MANAGE_BRANCH"]);
    const branchManager = await db.one(`INSERT INTO branch_managers (user_id, branch_id) VALUES ($1, $2) RETURNING *`, [user.id, branch_id]);
    res.status(200).json({
      success: true,
      data: {
        user,
        branchManager
      }
    })
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }   
}