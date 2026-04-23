"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Row, Col, message } from "antd";

const EditModal = ({ open, onClose, onSuccess, current, serviceTypes }: any) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && current) form.setFieldsValue(current);
        else form.resetFields();
    }, [open, current]);

    const handleFinish = async (values: any) => {
        // Compare with current to send only dirty fields
        const changedData: any = {};
        Object.keys(values).forEach(key => {
            if (values[key] !== current[key]) changedData[key] = values[key];
        });

        if (Object.keys(changedData).length === 0) return onClose();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/services/edit/${current.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(changedData),
            });

            if (res.ok) {
                message.success("Service updated!");
                onSuccess();
                onClose();
            }
        } catch (error) {
            message.error("Failed to update service");
        }
    };

    return (
        <Modal title="Edit Service" open={open} onCancel={onClose} onOk={form.submit}>
            <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                <Form.Item name="name" label="Service Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="type" label="Type">
                            <Select options={serviceTypes.map((t: string) => ({ label: t, value: t }))} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="price" label="Price">
                            <InputNumber className="w-full" min={0} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditModal;