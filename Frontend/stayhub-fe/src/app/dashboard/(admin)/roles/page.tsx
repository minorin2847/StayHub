"use client";

import { Role } from "@/types/Role";
import { Tag } from "antd";
import { useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import EditModal from "./components/EditModal";


export type RoleFilterData = {
    name: string | null;
    tier: string | null;
    mincount: string | null;
    maxcount: string | null;
    sort: string | null;
    order: string | null;
    page: string | null;
}

export type RoleTableData = Role & {
    usercount: string
}

export default function RoleList() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<RoleTableData | null>(null);

    return (
       <GenericTableView<RoleTableData, RoleFilterData>
            resourceName="Role"
            searchPlaceholder="Search by role name..."
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/roles`}
            loading={loading}
            setLoading={setLoading}
            renderCreateModal={(injected) => (
                <CreateModal
                    {...injected}
                />
            )}
            renderFilterModal={(injected) => (
                <FilterModal
                    {...injected}
                />
            )}
            renderEditModal={(injected) => (
                <EditModal
                    {...injected}
                />
            )}

            tableColumns={[
                {
                        title: "NAME",
                        dataIndex: "name",
                        key: "name",
                        render: (name: string) => name,
                        className: "text-slate-500",
                    },
                    {
                        title: "TIER",
                        key: "tier",
                        render: (_: unknown, record: RoleTableData) => {
                            const tierDict: {[tier: number]: {name: string, color: string}} = {
                                1: {name: "ADMIN", color: "red"},
                                2: {name: "BRANCH", color: "blue"},
                                3: {name: "HOTEL", color: "gold"},
                                4: {name: "ROOM", color: "purple"}
                            }
                            // Determine a tag color based on role
                            return (
                                <Tag color={tierDict[record.tier].color} className="rounded-full px-3 py-1 font-semibold border-none">
                                    {tierDict[record.tier].name}
                                </Tag>
                            );

                            
                        }
                    },
                    {
                        title: "USER COUNT",
                        dataIndex: "usercount",
                        key: "usercount",
                        render: (usercount: number) => usercount ?? '0',
                        className: "text-slate-500",
                    }
            ]}

            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}

            generatedDeletePrompt={(record: RoleTableData) => `Do you want to delete ${record.name}?`}
            generatedDeleteEndpoint={(record: RoleTableData) => `${process.env.NEXT_PUBLIC_API_URL}/employee/roles/delete/${record.name}`}
        />
    )
}