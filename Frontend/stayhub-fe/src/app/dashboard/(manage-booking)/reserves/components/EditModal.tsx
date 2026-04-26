"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col, message, AutoComplete, InputNumber, Select, DatePicker } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const EditReservedRoomModal = ({ open, onClose, onSuccess, current, rooms, roomTypes }: any) => {
    const [form] = Form.useForm();
    const [roomOptions, setRoomOptions] = useState<any[]>([]);

    useEffect(() => {
        if (open && current) {
            const roomInfo = rooms.find((r: any) => r.id === current.roomID);
            form.setFieldsValue({
                room_display: roomInfo?.name,
                roomID: current.roomID,
                booking_status: current.booking_status,
                payment_status: current.payment_status,
                final_price: current.final_price,
                dates: [dayjs(current.checkin_date), dayjs(current.checkout_date)]
            });
        }
    }, [open, current, rooms]);

    const handleRoomSearch = (searchText: string) => {
        const filtered = rooms
            .filter((r: any) => r.name.toLowerCase().includes(searchText.toLowerCase()))
            .map((r: any) => ({ label: r.name, value: r.name, id: r.id }));
        setRoomOptions(filtered);
    };

    const onSelectRoom = (value: string, option: any) => {
        const roomId = option.id;
        form.setFieldsValue({ roomID: roomId });

        const selectedRoomData = rooms.find((r: any) => r.id === roomId);
        if (selectedRoomData) {
            const matchingType = roomTypes.find((t: any) => t.id === selectedRoomData.typeid);
            if (matchingType) {
                form.setFieldsValue({ final_price: matchingType.base_price });
                message.info(`Price adjusted to ${matchingType.name} base rate.`);
            }
        }
    };

    const handleFinish = async (values: any) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/reserves/rooms/edit/${current.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomID: values.roomID,
                    booking_status: values.booking_status,
                    payment_status: values.payment_status,
                    final_price: values.final_price,
                    checkin_date: values.dates[0].format("YYYY-MM-DD"),
                    checkout_date: values.dates[1].format("YYYY-MM-DD"),
                }),
                credentials: "include",
            });

            if (!res.ok) throw new Error(await res.text());

            message.success("Reserved room updated");
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.message || "Failed to update room");
        }
    };

    return (
        <Modal title={<span><HomeOutlined /> Edit Reserved Room</span>} open={open} onCancel={onClose} onOk={form.submit} width={600} centered>
            <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Dates" name="dates" rules={[{required: true}]}>
                            <DatePicker.RangePicker className="w-full" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Room Assignment" name="room_display" rules={[{required: true}]}>
                            <AutoComplete options={roomOptions} showSearch={{onSearch:handleRoomSearch}} onSelect={onSelectRoom} />
                        </Form.Item>
                        <Form.Item name="roomID" hidden><InputNumber /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="final_price" label="Price ($)" rules={[{required: true}]}>
                            <InputNumber className="w-full" precision={2} min={0} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="booking_status" label="Booking Status" rules={[{required: true}]}>
                            <Select>
                                <Select.Option value="Pending">Pending</Select.Option>
                                <Select.Option value="Awaiting Confirmation">Awaiting Confirmation</Select.Option>
                                <Select.Option value="Confirmed">Confirmed</Select.Option>
                                <Select.Option value="Cancelled">Cancelled</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="payment_status" label="Payment Status" rules={[{required: true}]}>
                            <Select>
                                <Select.Option value="Unpaid">Unpaid</Select.Option>
                                <Select.Option value="Paid">Paid</Select.Option>
                                <Select.Option value="Refunded">Refunded</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EditReservedRoomModal;