"use client";
import React, { useState } from "react";
import { Modal, Form, Row, Col, message, InputNumber, DatePicker, Select } from "antd";
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

type AddReservedRoomFormValues = {
    roomTypeID: number;
    checkin_date: dayjs.Dayjs;
    checkout_date: dayjs.Dayjs;
    booking_status: string;
    payment_status: string;
    final_price: number;
};

const AddReservedRoomModal = ({ open, onClose, onSuccess, rooms, roomTypes, reserveId }: Props) => {
    const [form] = Form.useForm();
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(null);

    void rooms;

    const onSelectRoomType = (value: number) => {
        setSelectedRoomTypeId(value);
        const selectedType = roomTypes.find((roomType) => roomType.id === value);
        if (selectedType) {
            form.setFieldsValue({ final_price: selectedType.base_price });
        }
    };

    const handleFinish = async (values: AddReservedRoomFormValues) => {
        if (!reserveId) return;

        try {
            // Note: You will need to make sure this route is active on your backend!
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/reserves/${reserveId}/rooms/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomTypeID: values.roomTypeID,
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
        } catch (error: unknown) {
            message.error(error instanceof Error ? error.message : "Failed to add room");
        }
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedRoomTypeId(null);
        onClose();
    };

    return (
        <Modal title={<span><HomeOutlined /> Add Room Type to Reserve</span>} open={open} onCancel={handleClose} onOk={form.submit} width={600}>
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
                    <Col span={24}>
                        <Form.Item label="Room Type" name="roomTypeID" rules={[{required: true, message: "Please select a room type"}]}>
                            <Select
                                placeholder="Select room type"
                                onChange={onSelectRoomType}
                                options={roomTypes.map((roomType) => ({
                                    label: `${roomType.name} (#${roomType.id})`,
                                    value: roomType.id,
                                }))}
                            />
                        </Form.Item>
                        {selectedRoomTypeId ? (
                            <p className="mb-4 text-xs text-slate-500">
                                Physical room will be assigned later when receptionist approves the reserve.
                            </p>
                        ) : null}
                    </Col>
                </Row>
                <Row gutter={16}>
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
