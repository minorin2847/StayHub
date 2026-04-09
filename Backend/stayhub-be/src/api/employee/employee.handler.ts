import db from "@/database/db.js";
import { passport } from "@/utils/initializeSession.js";
import type { NextFunction, Request, Response } from "express";
import type { CreateEmployeeInput } from "./employee.type.js";
import crypto from "node:crypto";
import Employee from "./employee.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";

const employeeColumns = new (pgPromise().helpers.ColumnSet)(
[
    { name: 'branchid', skip: (c: any) => c.value === undefined },
    { name: 'hotelid', skip: (c: any) => c.value === undefined },
    { name: 'firstname', skip: (c: any) => c.value === undefined },
    { name: 'lastname', skip: (c: any) => c.value === undefined },
    { name: 'salary', skip: (c: any) => c.value === undefined }
  ],
  {
    table: "employees"
  }
);

const roleColumnSet = new (pgPromise().helpers.ColumnSet)(
  [
    'employeeid', 
    'role'
  ], 
  { table: 'employee_roles' }
);

export async function findEmployeeByUsername(
  username: string,
): Promise<Employee> {
  const employee = await db.oneOrNone(
    "SELECT * FROM get_user_auth_context($1)",
    [username],
  );
  if (!employee) {
    throw Error(`Can't find employee with username ${username}!`);
  }
  return new Employee(employee);
}

export function login(req: Request, res: Response, next: NextFunction) {
  return passport.authenticate(
    "employee-login",
    (err: any, user: any, info: any, status: any) => {
      if (err) return next(err);
      if (!user) res.status(404).send("Incorrect username or password!");
      findEmployeeByUsername(user.username)
        .then(() => {
          req.login(user, (err) => {
            if (err) return next(err);
            res.status(200).send("Login successful!");
          });
        })
        .catch(() => res.status(404).send("Incorrect username or password!"));
    },
  )(req, res, next);
}

export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).send("Logout successful!");
  });
}

export function createEmployee(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const salt = crypto.randomBytes(16);
  const {
    username,
    password,
    firstname,
    lastname,
    email,
    roles,
    hotelid,
    branchid,
    salary
  } = req.body;
  if (!firstname || !username || !email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
  }
  findEmployeeByUsername(username)
    .then(() => res.status(409).send("Employee already exists!"))
    .catch(() => {
      crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, hashed) => {
        if (err) return next(err);
        rlsWrapper(
          "sign-up",
          req.user,
          async t => {
              const employee = await t.one(
              "INSERT INTO employees(username, salt, hash, email, firstName, lastName, hotelid, branchid, salary)\
                      VALUES ($(username), $(salt), $(hash), $(email), $(firstName), $(lastName), $(hotelid), $(branchid), $(salary)) \
                      RETURNING id, username, email, firstName, lastName, hotelid, branchid, salary",
              {
                username: username,
                salt: salt,
                hash: hashed,
                email: email,
                firstName: firstname,
                lastName: lastname,
                hotelid: hotelid,
                branchid: branchid,
                salary: salary
              },
            );
            for (const role of roles) {
              await t.one("INSERT INTO employee_roles(employeeid, role)\
                          VALUES ($(employeeid), $(role))\
                          RETURNING employeeid, role", {
                            employeeid: employee.id,
                            role: role
                          })
            }
            return employee
          },
          userAccount => {
            console.log(
              `Created account ${userAccount.firstname} ${userAccount.lastname} (${userAccount.username}), ID ${userAccount.id} with email ${userAccount.email}!`,
            );
            res.status(200).json(userAccount);
          }
        )
      });
    });
}




export function editEmployee(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);
  const { roles, ...employeeData } = req.body; // Separate roles from the rest


  if (Object.keys(req.body).length === 0) {
    return res.status(400).send("No data provided!");
  }

  rlsWrapper('update-employee', req.user,
    async t => {
      let updatedRow;

      // 1. Update Employee Table (if there is data besides roles)
      if (Object.keys(employeeData).length > 0) {
        const query = pgPromise().helpers.update(employeeData, employeeColumns)
                    + pgPromise().as.format(' WHERE id=$1 RETURNING *', [id]);
        updatedRow = await t.oneOrNone(query);
      } else {
        // If only roles were sent, we need to fetch the current employee to return it
        updatedRow = await t.oneOrNone('SELECT * FROM employees WHERE id = $1', [id]);
      }

      if (!updatedRow) return null;

      // 2. Update Roles (if provided in body)
      if (roles && Array.isArray(roles)) {
        // First, wipe existing roles for this user
        await t.none('DELETE FROM employee_roles WHERE employeeID = $1', [id]);

        // If the new list isn't empty, insert them
        if (roles.length > 0) {
          const roleValues = roles.map(roleName => ({ employeeid: id, role: roleName }));
          const roleQuery = pgPromise().helpers.insert(roleValues, roleColumnSet);
          await t.none(roleQuery);
        }
      }

      // 3. Return the fully re-constructed Employee (using your SQL function to get the fresh roles)
      const finalResult = await t.one('SELECT * FROM get_user_from_id($1)', [id]);
      return new Employee(finalResult);
    },
    updatedEmployee => {
      if (!updatedEmployee) {
        return res.status(404).send("Employee not found!");
      }
      res.status(200).json(updatedEmployee);
    }
  );
}

export function getEmployee(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);

  rlsWrapper('find-employee', req.user,
    async t => {
      return t.oneOrNone("SELECT * FROM get_user_from_id($1)", [id], row => new Employee(row))
    },
    employee => {
      if (!employee) {
        return res.status(404).send("Employee not found!")
      }
      console.log(employee)
      res.status(200).json(employee)
    }
  )
}

export function deleteEmployee(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);

  rlsWrapper('delete-employee', req.user,
    async t => {
      return await t.oneOrNone("DELETE FROM employees WHERE id=$1 RETURNING id", [id]);
    },
    result => {
      if (!result) {
        return res.status(404).send("Employee not found or already deleted!");
      }
      res.status(200).send("Employee deleted successfully");
    }
  )
}