
import { Modal, Table, Input, Button, message } from "antd";
import { useState, useEffect, useMemo } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { GlobalBedData, HotelBedTableData } from "../ManageHotelBedView";
import AddNewBedModal from "./AddNewBedModal";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
    hotelBeds: HotelBedTableData[];
}

export default function CreateModal({ open, onClose, onSuccess, hotelBeds }: Props) {
    const [beds, setBeds] = useState<GlobalBedData[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);


    const fetchGlobalBeds = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("query", search);
            
            // Tell the server to exclude beds I already have
            params.append("excludeCurrent", "true");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/beds?${params.toString()}`, {
                credentials: "include"
            });
            const data = await res.json();
            setBeds(data.response || []);
        } catch (e) {
            message.error("Failed to load global bed types");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchGlobalBeds();
    }, [open, search]);

    const handleAdd = async () => {
        if (!selectedName) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/beds/hotels/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selectedName }),
                credentials: "include"
            });
            if (res.ok) {
                message.success("Bed added to hotel!");
                await onSuccess();
                setSelectedName(null);
                onClose();
            } else {
                message.error("Bed already exists in this hotel.");
            }
        } catch (e) {
            message.error("Error adding bed.");
        }
    };

    return (
        <Modal
            title="Select Bed Type to Add"
            open={open}
            onCancel={onClose}
            width={700}
            footer={[
                <Button key="reset" onClick={() => setSelectedName(null)}>Reset Selected</Button>,
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="add" type="primary" className="bg-emerald-600" disabled={!selectedName} onClick={handleAdd}>
                    Add to Hotel
                </Button>
            ]}
        >
            <div className="flex flex-col gap-4">
                <Input 
                    prefix={<FaMagnifyingGlass className="text-slate-400" />}
                    placeholder="Search global beds..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-10 rounded-xl"
                />
                
                <Table
                    dataSource={beds}
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    rowKey="bed_name"
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: selectedName ? [selectedName] : [],
                        onChange: (keys) => setSelectedName(keys[0] as string),
                        renderCell: () => null,
                        columnWidth: 0
                    }}
                    onRow={(record) => ({
                        onClick: () => setSelectedName(record.bed_name),
                        className: "cursor-pointer"
                    })}
                    columns={[
                        { title: 'Bed Name', dataIndex: 'bed_name', key: 'name' },
                        { title: 'Global Usage', dataIndex: 'hotel_count', key: 'count', render: (val) => `${val} hotels` }
                    ]}
                />

                <p className="text-slate-500 text-sm">
                    Can't find what you wanted?{" "}
                    <span 
                        className="text-blue-500 cursor-pointer font-semibold hover:underline"
                        onClick={() => setIsAddingNew(true)}
                    >
                        Create new...
                    </span>
                </p>
            </div>

            <AddNewBedModal 
                open={isAddingNew} 
                onClose={() => setIsAddingNew(false)} 
                onCreated={() => {
                    setIsAddingNew(false);
                    fetchGlobalBeds();
                }}
            />
        </Modal>
    );
}