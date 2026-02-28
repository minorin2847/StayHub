import db from "@/database/db.js";
import Employee from "./employee.js";
import { EmployeeService } from "./employee.service.js";
import type { Request, Response } from "express";
import type { CreateEmployeeInput } from "./employee.type.js";

export async function findEmployee(accountID: number): Promise<Employee> {
    const employee = await db.oneOrNone("SELECT * FROM employees WHERE accountid=$1", [accountID]);
    if (!employee) {
        throw Error(`Can't find employee with account id ${accountID}!`);
    }
    return new Employee(employee);
}

export const createEmployeeHandler = async (req: Request, res: Response) => {
    try {
        const hostEmployeeID = 1; // Lấy từ middleware Auth req.user.employeeID
        const data: CreateEmployeeInput = req.body;

        const hostInfo = await EmployeeService.getHostPrivilegeInfo(hostEmployeeID);
        if (!hostInfo) return res.status(403).json({ message: "Không tìm thấy thông tin quyền của bạn." });

        const targetTier = await EmployeeService.getRoleTier(data.targetRole);
        if (!targetTier) return res.status(400).json({ message: "Chức vụ (Role) không hợp lệ." });

        // RULE 1: check level (Tier nhỏ = Quyền to)
        if (hostInfo.tier >= targetTier) {
            return res.status(403).json({ message: "Không được phép tạo tài khoản cấp bậc cao hơn hoặc bằng mình." });
        }

        // RULE 2: check scope (Khách sạn / Chi nhánh)
        if (hostInfo.role === 'MANAGE_HOTEL') {
            if (hostInfo.hotelid !== data.targetHotelID) {
                return res.status(403).json({ message: "Chỉ được tạo nhân viên cho khách sạn của mình." });
            }
        } else if (hostInfo.role === 'MANAGE_BRANCH') {
            if (!data.targetHotelID) return res.status(400).json({ message: "Vui lòng chọn khách sạn thuộc chi nhánh." });
            
            const isValidBranch = await EmployeeService.isHotelInBranch(data.targetHotelID, hostInfo.branch_id);
            if (!isValidBranch) {
                return res.status(403).json({ message: "Chỉ được tạo nhân viên cho khách sạn thuộc chi nhánh của mình." });
            }
        }

        // Thực thi tạo dữ liệu qua Service
        await EmployeeService.createNewEmployeeTransaction(data);

        return res.status(201).json({ message: "Tạo tài khoản thành công!" });

    } catch (error: any) {
        console.error("Lỗi tạo nhân viên:", error);
        if (error.code === '23505') { 
            return res.status(400).json({ message: "Tên đăng nhập hoặc Email đã tồn tại." });
        }
        return res.status(500).json({ message: "Lỗi Server nội bộ." });
    }
};