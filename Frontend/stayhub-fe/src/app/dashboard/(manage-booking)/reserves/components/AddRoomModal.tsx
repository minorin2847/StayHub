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
    reserveId: number | null; 
}

const AddReservedRoomModal = ({ open, onClose, onSuccess, rooms, roomTypes, reserveId }: Props) => {
    const [form] = Form.useForm();
    const [roomOptions, setRoomOptions] = useState<any[]>([]);

    const handleRoomSearch = (searchText: string) => {
        const filtered = rooms
            .filter((room: Room) => room.name.toLowerCase().includes(searchText.toLowerCase()))
            .map((room: Room) => ({ label: room.name, value: room.name, id: room.id }));
        setRoomOptions(filtered);
    };

    const onSelectRoom = (value: string, option: any) => {
        const roomId = option.id;
        form.setFieldsValue({ roomID: roomId });
        
        const selectedRoomData = rooms.find(r => r.id === roomId);
        if (selectedRoomData) {
            const matchingType = roomTypes.find(t => t.id === (selectedRoomData as any).typeid);
            if (matchingType) form.setFieldsValue({ final_price: matchingType.base_price });
        }
    };

    const handleFinish = async (values: any) => {
        if (!reserveId) return;

        try {
            // Note: You will need to make sure this route is active on your backend!
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/reserves/${reserveId}/rooms/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomID: values.roomID,
                    checkin_date: values.checkin_date.format("YYYY-MM-DD"),
                    checkout_date: values.checkout_date.format("YYYY-MM-DD"),
                    booking_status: values.booking_status,
                    payment_status: values.payment_status,
                    final_price: values.final_price 
                }),
                credentials: "include"
            });

            if (!res.ok) throw new Error(await res.text());

            message.success("Room successfully added to cart!");
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
        <Modal title={<span><HomeOutlined /> Add Room to Cart</span>} open={open} onCancel={handleClose} onOk={form.submit} width={600}>
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ checkin_date: dayjs(), checkout_date: dayjs().add(5, 'day'), booking_status: 'Pending', payment_status: 'Unpaid' }} className="mt-4">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="checkin_date" label="Check-in Date" rules={[{required: true}]}>
                            <DatePicker className="w-full" format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="checkout_date" label="Check-out Date" rules={[{required: true}]} dependencies={['checkin_date']}>
                            <DatePicker className="w-full" format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Select Room" name="room_display" rules={[{required: true}]}>
                            <AutoComplete options={roomOptions} showSearch={{onSearch:handleRoomSearch}} onSelect={onSelectRoom} />
                        </Form.Item>
                        <Form.Item name="roomID" hidden><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="final_price" label="Price ($)" rules={[{required: true}]}>
                            <InputNumber className="w-full" precision={2} min={0} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="booking_status" label="Initial Status" rules={[{required: true}]}>
                            <Select>
                                <Select.Option value="Pending">Pending</Select.Option>
                                <Select.Option value="Awaiting Confirmation">Awaiting Confirmation</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="payment_status" label="Payment Status" rules={[{required: true}]}>
                            <Select>
                                <Select.Option value="Unpaid">Unpaid</Select.Option>
                                <Select.Option value="Paid">Paid</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddReservedRoomModal;