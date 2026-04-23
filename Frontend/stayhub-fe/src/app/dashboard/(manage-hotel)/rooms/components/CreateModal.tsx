"use client";
import React from "react";
import { Modal, Form, Input, Select, Row, Col, message } from "antd";

const CreateModal = ({ open, onClose, onSuccess, roomTypes }: any) => {
    const [form] = Form.useForm();

    const handleFinish = async (values: any) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/create`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(values),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            message.success("Room created successfully!");
            onSuccess();
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(`Creation failed: ${error.message}`);
        }
    };

    return (
        <Modal
            title="Create New Room"
            open={open}
            onCancel={onClose}
            onOk={form.submit}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="mt-4"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Room Name/Number"
                            rules={[{ required: true, message: "Please input a room name or number" }]}
                        >
                            <Input placeholder="e.g. 101 or Presidential Suite" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="typeid"
                            label="Room Type"
                            rules={[{ required: true, message: "Please select a room type" }]}
                        >
                            <Select
                                placeholder="Select a room type"
                                showSearch={{
                                    filterOption: (input, option) =>
                                        (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                }}
                                options={roomTypes.map((t: any) => ({
                                    label: t.name,
                                    value: t.id,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="note" label="Notes">
                    <Input.TextArea
                        rows={4}
                        placeholder="Add any specific details, maintenance notes, or features..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateModal;