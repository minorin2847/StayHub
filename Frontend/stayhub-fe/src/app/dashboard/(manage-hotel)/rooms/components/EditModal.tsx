"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Row, Col, message } from "antd";

const EditModal = ({ open, onClose, onSuccess, current, roomTypes }: any) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && current) form.setFieldsValue(current);
        else form.resetFields();
    }, [open, current, form]);

    const handleFinish = async (values: any) => {
        // Compare with current to send only dirty fields
        const changedData: any = {};
        Object.keys(values).forEach(key => {
            if (values[key] !== current[key]) changedData[key] = values[key];
        });

        if (Object.keys(changedData).length === 0) return onClose();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/edit/${current.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(changedData),
            });

            if (res.ok) {
                message.success("Room updated successfully!");
                onSuccess();
                onClose();
            } else {
                throw new Error(await res.text());
            }
        } catch (error: any) {
            message.error(`Failed to update room: ${error.message}`);
        }
    };

    return (
        <Modal title="Edit Room" open={open} onCancel={onClose} onOk={form.submit}>
            <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="name" label="Room Name/Number" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="typeid" label="Room Type" rules={[{ required: true }]}>
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
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditModal;