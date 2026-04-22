import db from "@/database/db.js";
import type { NextFunction, Request, Response } from "express";
import Policy from "./policy.js";
import rlsWrapper from "@/utils/rlsWrapper.js";

export async function findPolicyByName(name: string): Promise<Policy | null> {
  const policy = await db.oneOrNone("SELECT * FROM policies WHERE name = $1", [
    name,
  ]);
  return policy ? new Policy(policy) : null;
}

export function getPolicyStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  rlsWrapper(
    "get-policy-stats",
    req.user,
    async (t) => {
      const totalRes = await t.one(
        "SELECT COUNT(*)::int as total FROM policies",
      );
      const lastUpdateRes = await t.oneOrNone(
        "SELECT MAX(updated_at) as last_revision FROM policies",
      );

      return {
        total: totalRes.total,
        lastRevision: lastUpdateRes ? lastUpdateRes.last_revision : null,
      };
    },
    (stats) => res.status(200).json(stats),
  );
}

export function getPolicyList(req: Request, res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string) || 1;
  const name = (req.query.name as string) || null;
  const category = (req.query.category as string) || null;
  const sortColumn = (req.query.sort as string) || "updated_at";
  const sortDir = (req.query.order as string) || "DESC";

  rlsWrapper(
    "list-policies",
    req.user,
    async (t) => {
      const rawData = await t.any(
        `SELECT * FROM get_policies_by_page($1::text, $2::text, $3::text, $4::text, $5::int)`,
        [name, category, sortColumn, sortDir, page],
      );

      const hasNext = rawData.length > 0 ? rawData[0].has_next : false;
      const response = rawData.map(({ has_next, ...rest }) => rest);

      return { response, hasNext };
    },
    (result) => res.status(200).json(result),
  );
}

export function createPolicy(req: Request, res: Response, next: NextFunction) {
  const { name, icon, description, category } = req.body;
  if (!name || !description || !icon) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
  }

  db.oneOrNone("SELECT name FROM policies WHERE name = $1", [name])
    .then((existingPolicy) => {
      if (existingPolicy) {
        return res.status(409).send("Policy đã tồn tại!");
      }

      rlsWrapper(
        "create-policy",
        req.user,
        async (t) => {
          return await t.one(
            `INSERT INTO policies(name, icon, description, category) 
             VALUES ($(name), $(icon), $(description), $(category)) RETURNING *`,
            {
              name,
              icon,
              description,
              category: category || "General",
            },
          );
        },
        (newPolicy) => res.status(200).json(newPolicy),
      );
    })
    .catch((err) => next(err));
}

export function editPolicy(req: Request, res: Response, next: NextFunction) {
  const originalName = req.params.name;
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).send("Không có dữ liệu update!");
  }

  rlsWrapper(
    "update-policy",
    req.user,
    async (t) => {
      updateData.updated_at = new Date();

      const setKeys = Object.keys(updateData)
        .map((key, index) => `"${key}" = $${index + 2}`)
        .join(", ");
      const values = Object.values(updateData);

      const query = `UPDATE policies SET ${setKeys} WHERE name = $1 RETURNING *`;
      return await t.oneOrNone(query, [originalName, ...values]);
    },
    (updatedPolicy) => {
      if (!updatedPolicy) return res.status(404).send("Không tìm thấy Policy!");
      res.status(200).json(updatedPolicy);
    },
  );
}

export function deletePolicy(req: Request, res: Response, next: NextFunction) {
  rlsWrapper(
    "delete-policy",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        "DELETE FROM policies WHERE name=$1 RETURNING name",
        [req.params.name],
      );
    },
    (result) => {
      if (!result) return res.status(404).send("Lỗi xóa policy!");
      res.status(200).send("Xóa thành công");
    },
  );
}
