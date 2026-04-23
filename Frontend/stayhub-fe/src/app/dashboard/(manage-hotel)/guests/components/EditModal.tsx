"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, Row, Col, message } from "antd";

const EditModal = ({ open, onClose, onSuccess, current }: any) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && current) form.setFieldsValue(current);
    }, [open, current]);

    const handleFinish = async (values: any) => {
        const changedData: any = {};
        Object.keys(values).forEach(key => {
            if (values[key] !== current[key]) changedData[key] = values[key];
        });

        if (Object.keys(changedData).length === 0) return onClose();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/guests/edit/${current.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(changedData),
            });
            if (res.ok) {
                message.success("Guest profile updated");
                onSuccess();
                onClose();
            } else {
                throw new Error(await res.text());
            }
        } catch (error: any) {
            message.error(error.message || "Failed to update guest");
        }
    };

    return (
        <Modal title="Edit Guest Profile" open={open} onCancel={onClose} onOk={form.submit} width={650}>
            <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="first_name" 
                            label="First Name" 
                            rules={[{ required: true, message: "First name cannot be empty" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="last_name" 
                            label="Last Name" 
                            rules={[{ required: true, message: "Last name cannot be empty" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="phone" 
                            label="Phone Number" 
                            rules={[{ required: true, message: "Phone number is required" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label="Email">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="id_card_number" label="ID / Passport Number">
                    <Input />
                </Form.Item>
                <Form.Item name="address" label="Address">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditModal;