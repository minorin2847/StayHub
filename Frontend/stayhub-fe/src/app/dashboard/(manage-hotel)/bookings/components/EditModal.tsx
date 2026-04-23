"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Row, Col, message, AutoComplete, InputNumber, Select, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";

const EditModal = ({ open, onClose, onSuccess, current, rooms, roomTypes }: any) => {
    const [form] = Form.useForm();
    const [roomOptions, setRoomOptions] = useState<any[]>([]);

    useEffect(() => {
        if (open && current) {
            // Find current room name to display in autocomplete
            const currentRoom = rooms.find((r: any) => r.id === current.roomid);
            form.setFieldsValue({
                ...current,
                room_display: currentRoom?.name
            });
        }
    }, [open, current, rooms]);

    const handleRoomSearch = (searchText: string) => {
        const filtered = rooms
            .filter((r: any) => r.name.toLowerCase().includes(searchText.toLowerCase()))
            .map((r: any) => ({ label: r.name, value: r.name, id: r.id }));
        setRoomOptions(filtered);
    };

    // Logic to handle room selection and price auto-fill
    const onSelectRoom = (value: string, option: any) => {
        const roomId = option.id;
        form.setFieldsValue({ roomID: roomId });

        // Find the room data to get its type
        const selectedRoomData = rooms.find((r: any) => r.id === roomId);
        
        if (selectedRoomData) {
            // Match the room's type to the roomTypes list
            const typeID = selectedRoomData.typeid;
            const matchingType = roomTypes.find((t: any) => t.id === typeID);

            if (matchingType) {
                // Update the price field with the base price of the new room
                form.setFieldsValue({ actual_total_price: matchingType.base_price });
                message.info(`Price adjusted to ${matchingType.name} base rate.`);
            }
        }
    };

    const handleFinish = async (values: any) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/edit/${current.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomid: values.roomID,
                    booking_status: values.booking_status,
                    actual_total_price: values.actual_total_price
                }),
                credentials: "include",
            });

            if (!res.ok) throw new Error(await res.text());

            message.success("Booking updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.message || "Failed to update booking");
        }
    };

    return (
        <Modal title="Edit Booking" open={open} onCancel={onClose} onOk={form.submit} width={650}>
            <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-blue-800 font-bold flex items-center gap-2">
                        <UserOutlined /> Guest Information (Read Only)
                    </div>
                    <div className="text-blue-600 text-sm mt-1">
                        {current?.guest_full_name} • ID: {current?.guestid}
                    </div>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Room" name="room_display" rules={[{required: true}]}>
                            <AutoComplete
                                options={roomOptions}
                                showSearch={{ onSearch: handleRoomSearch }}
                                onSelect={onSelectRoom} // Trigger price update on select
                            />
                        </Form.Item>
                        <Form.Item name="roomID" hidden><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="booking_status" label="Status" rules={[{required: true}]}>
                            <Select>
                                <Select.Option value="Checked-In">Checked-In</Select.Option>
                                <Select.Option value="Stayed">Stayed</Select.Option>
                                <Select.Option value="Checked-Out">Checked-Out</Select.Option>
                                <Select.Option value="Cancelled">Cancelled</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="actual_total_price" 
                            label="Final Total Price ($)" 
                            rules={[{required: true}]}
                            extra="Price will reset to base rate if room is changed."
                        >
                            <InputNumber className="w-full" precision={2} />
                        </Form.Item>
                    </Col>
                </Row>
                
                <Divider />
                <p className="text-slate-400 text-xs italic text-center">
                    Note: To modify guest personal details, please use the Guests Directory.
                </p>
            </Form>
        </Modal>
    );
};

export default EditModal;