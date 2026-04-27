"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col, message, AutoComplete, InputNumber, Select, DatePicker } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Room, RoomType } from "@/types/Room";
import { ReservedRoom } from "@/types/Reserve";

type EditReservedRoomModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
    current: ReservedRoom | null;
    rooms: Room[];
    roomTypes: RoomType[];
};

type RoomOption = {
    label: string;
    value: string;
    id: number;
};

type EditReservedRoomFormValues = {
    room_display: string;
    roomID: number;
    roomTypeID: number;
    booking_status: string;
    payment_status: string;
    final_price: number;
    dates: [dayjs.Dayjs, dayjs.Dayjs];
};

const EditReservedRoomModal = ({ open, onClose, onSuccess, current, rooms, roomTypes }: EditReservedRoomModalProps) => {
    const [form] = Form.useForm();
    const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);

    useEffect(() => {
        if (open && current) {
            const roomInfo = rooms.find((room) => room.id === current.roomID);
            form.setFieldsValue({
                room_display: roomInfo?.name || current.room_name,
                roomID: current.roomID,
                roomTypeID: current.roomTypeID,
                booking_status: current.booking_status,
                payment_status: current.payment_status,
                final_price: current.final_price,
                dates: [dayjs(current.checkin_date), dayjs(current.checkout_date)]
            });
        }
    }, [current, form, open, rooms]);

    const handleRoomSearch = (searchText: string) => {
        const filtered = rooms
            .filter((room) =>
                room.typeid === current?.roomTypeID &&
                room.name.toLowerCase().includes(searchText.toLowerCase())
            )
            .map((room) => ({ label: room.name, value: room.name, id: room.id }));
        setRoomOptions(filtered);
    };

    const onSelectRoom = (_value: string, option: RoomOption) => {
        const roomId = option.id;
        form.setFieldsValue({ roomID: roomId });

        const selectedRoomData = rooms.find((room) => room.id === roomId);
        if (selectedRoomData) {
            const matchingType = roomTypes.find((roomType) => roomType.id === selectedRoomData.typeid);
            if (matchingType) {
                form.setFieldsValue({ final_price: matchingType.base_price });
                message.info(`Price adjusted to ${matchingType.name} base rate.`);
            }
        }
    };

    const handleFinish = async (values: EditReservedRoomFormValues) => {
        if (!current) return;

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
        } catch (error: unknown) {
            message.error(error instanceof Error ? error.message : "Failed to update room");
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
                        <Form.Item name="roomTypeID" hidden><InputNumber /></Form.Item>
                        <p className="mt-[-12px] text-xs text-slate-500">
                            Reserve type: <b>{current?.room_type_name || "Unknown"}</b>
                        </p>
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
