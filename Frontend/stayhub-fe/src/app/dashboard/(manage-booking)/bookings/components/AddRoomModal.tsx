"use client";
import React, { useState } from "react";
import { Modal, Form, Input, Row, Col, message, AutoComplete, InputNumber, DatePicker, Select } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Room, RoomType } from "@/types/Room";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
    rooms: Room[];
    roomTypes: RoomType[];
    bookingId: number | null; // We need the parent booking ID
}

const AddRoomModal = ({ open, onClose, onSuccess, rooms, roomTypes, bookingId }: Props) => {
    const [form] = Form.useForm();
    const [roomOptions, setRoomOptions] = useState<{ label: string; value: string; id: number }[]>([]);

    const handleRoomSearch = (searchText: string) => {
        if (!searchText) {
            setRoomOptions([]);
            return;
        }
        const filtered = rooms
            .filter((room: Room) => room.name.toLowerCase().includes(searchText.toLowerCase()))
            .map((room: Room) => ({
                label: room.name,
                value: room.name,
                id: room.id
            }));
        setRoomOptions(filtered);
    };

    const onSelectRoom = (value: string, option: any) => {
        const roomId = option.id;
        form.setFieldsValue({ roomID: roomId });
        
        const selectedRoomData = rooms.find(r => r.id === roomId);
        if (selectedRoomData) {
            const typeID = (selectedRoomData as any).typeid;
            const matchingType = roomTypes.find(t => t.id === typeID);
            if (matchingType) {
                // Notice we changed 'actual_total_price' to 'roomPrice' to match the new schema
                form.setFieldsValue({ roomPrice: matchingType.base_price });
                message.info(`Price auto-filled for ${matchingType.name}`);
            }
        }
    };

    const handleFinish = async (values: any) => {
        if (!bookingId) {
            message.error("Cannot add room: Missing Booking ID");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/${bookingId}/rooms/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomID: values.roomID,
                    checkin_date: values.checkin_date.format("YYYY-MM-DD"),
                    checkout_date: values.checkout_date.format("YYYY-MM-DD"),
                    room_status: values.room_status,
                    roomPrice: values.roomPrice 
                }),
                credentials: "include"
            });

            if (!res.ok) throw new Error(await res.text());

            message.success("Room successfully added to booking!");
            onSuccess();
            handleClose();
        } catch (error: any) {
            message.error(error.message || "Failed to add room");
        }
    };

    const handleClose = () => {
        form.resetFields();
        setRoomOptions([]);
        onClose();
    };

    return (
        <Modal 
            title={<span><HomeOutlined /> Add Additional Room</span>} 
            open={open} 
            onCancel={handleClose} 
            onOk={form.submit} 
            width={600}
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFinish}
                initialValues={{
                    checkin_date: dayjs(),
                    checkout_date: dayjs().add(5, 'day'),
                    room_status: 'Reserved' // Default status for a newly added room
                }}
                className="mt-4"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="checkin_date" label="Check-in Date" rules={[{required: true}]}>
                            <DatePicker className="w-full" format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="checkout_date" 
                            label="Check-out Date" 
                            rules={[{required: true}]}
                            dependencies={['checkin_date']}
                        >
                            <DatePicker 
                                className="w-full" 
                                format="YYYY-MM-DD" 
                                disabledDate={(current) => {
                                    const checkin = form.getFieldValue('checkin_date');
                                    return current && current <= (checkin || dayjs().startOf('day'));
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            label="Select Room" 
                            name="room_display_name" 
                            rules={[{required: true, message: 'Please select a room'}]}
                        >
                            <AutoComplete
                                options={roomOptions}
                                showSearch={{onSearch:handleRoomSearch}}
                                onSelect={onSelectRoom}
                                placeholder="Search room by name..."
                            />
                        </Form.Item>
                        <Form.Item name="roomID" hidden><Input /></Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Form.Item name="room_status" label="Initial Status" rules={[{required: true}]}>
                            <Select>
                                <Select.Option value="Reserved">Reserved</Select.Option>
                                <Select.Option value="Checked-In">Checked-In</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="roomPrice" label="Nightly Rate / Price ($)" rules={[{required: true}]}>
                            <InputNumber className="w-full" precision={2} min={0} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddRoomModal;