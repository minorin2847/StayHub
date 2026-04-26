"use client";

import { Modal, Table, Input, Button, message } from "antd";
import { useState, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import AddNewAmenityModal from "./AddNewAmenityModal";
import { Amenity } from "@/types/Amenity";

import { 
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling 
} from "react-icons/fa";

const ICON_MAP: Record<string, React.ElementType> = {
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling 
};

interface GlobalAmenityData extends Amenity {
    hotel_count: number;
}

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export default function CreateModal({ open, onClose, onSuccess }: CreateModalProps) {
    const [amenities, setAmenities] = useState<GlobalAmenityData[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    const fetchGlobalAmenities = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("name", search);
            
            // Tell the server to exclude amenities I already have
            params.append("excludeCurrent", "true");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/amenities/list?${params.toString()}`, {
                credentials: "include"
            });
            const data = await res.json();
            setAmenities(data.response || []);
        } catch (e) {
            message.error("Failed to load global amenities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchGlobalAmenities();
    }, [open, search]);

    const handleAdd = async () => {
        if (!selectedName) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/amenities/add-to-hotel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selectedName }),
                credentials: "include"
            });
            if (res.ok) {
                message.success("Amenity added to hotel!");
                await onSuccess();
                setSelectedName(null);
                onClose();
            } else {
                message.error("Amenity already exists in this hotel.");
            }
        } catch (e) {
            message.error("Error adding amenity.");
        }
    };

    return (
        <Modal
            title={
                <div className="mb-2">
                    <h2 className="text-[22px] font-bold text-slate-800 leading-tight">Select Amenity to Add</h2>
                    <p className="text-sm text-slate-500 font-normal mt-1">Choose from existing amenities or create a new one</p>
                </div>
            }
            open={open}
            onCancel={onClose}
            width={700}
            footer={[
                <Button key="reset" onClick={() => setSelectedName(null)}>Reset Selected</Button>,
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="add" type="primary" className="bg-blue-600 hover:bg-blue-700" disabled={!selectedName} onClick={handleAdd}>
                    Add to Hotel
                </Button>
            ]}
            className="custom-amenity-modal"
        >
            <div className="flex flex-col gap-4 mt-4">
                <Input 
                    prefix={<FaMagnifyingGlass className="text-slate-400" />}
                    placeholder="Search global amenities..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-10 rounded-xl"
                />
                
                <Table
                    dataSource={amenities}
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    rowKey="name"
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: selectedName ? [selectedName] : [],
                        onChange: (keys) => setSelectedName(keys[0] as string),
                        renderCell: () => null,
                        columnWidth: 0
                    }}
                    onRow={(record) => ({
                        onClick: () => setSelectedName(record.name),
                        className: "cursor-pointer"
                    })}
                    columns={[
                        { 
                            title: 'Icon', 
                            dataIndex: 'icon', 
                            key: 'icon',
                            render: (iconName: string) => {
                                const IconComponent = ICON_MAP[iconName];
                                return (
                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex justify-center items-center text-md shadow-sm">
                                        {IconComponent ? <IconComponent /> : "✨"}
                                    </div>
                                );
                            }
                        },
                        { title: 'Amenity Name', dataIndex: 'name', key: 'name', className: "font-semibold text-slate-700" },
                        { title: 'Category', dataIndex: 'category', key: 'category', className: "text-slate-500" },
                        { title: 'Global Usage', dataIndex: 'hotel_count', key: 'count', render: (val) => `${val} hotels` }
                    ]}
                />

                <p className="text-slate-500 text-sm">
                    Can't find what you wanted?{" "}
                    <span 
                        className="text-blue-600 cursor-pointer font-semibold hover:underline"
                        onClick={() => setIsAddingNew(true)}
                    >
                        Create new...
                    </span>
                </p>
            </div>

            <AddNewAmenityModal 
                open={isAddingNew} 
                onClose={() => setIsAddingNew(false)} 
                onCreated={() => {
                    setIsAddingNew(false);
                    fetchGlobalAmenities();
                }}
            />
        </Modal>
    );
}