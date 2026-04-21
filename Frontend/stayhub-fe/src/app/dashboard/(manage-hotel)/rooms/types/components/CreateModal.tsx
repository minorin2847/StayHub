"use client";
import React from "react";
import { Modal, Form, Input, InputNumber, Select, Row, Col, message, AutoComplete, Button, Space, Divider } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Amenity } from "@/types/Amenity";
import { Bed } from "@/types/Bed";

interface CreateModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    masterAmenities: Amenity[];
    masterBeds: Bed[];
}

const CreateModal = ({ open, onClose, onSuccess, masterAmenities, masterBeds }: CreateModalProps) => {
    const [form] = Form.useForm();

    const handleFinish = async (values: any) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/types/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error(await res.text());
            message.success("Room type created!");
            onSuccess();
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error.message);
        }
    };

    return (
        <Modal title="Create Room Type" open={open} onCancel={onClose} onOk={form.submit} width={700}>
            <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="size" label="Size (m²)" rules={[{ required: true }]}><InputNumber className="w-full" min={1} /></Form.Item></Col>
                    <Col span={6}><Form.Item name="capacity" label="Capacity" rules={[{ required: true }]}><InputNumber className="w-full" min={1} /></Form.Item></Col>
                </Row>

                <Form.Item name="amenities" label="Amenities">
                    <Select mode="multiple" placeholder="Select amenities"
                        options={masterAmenities.map((a: any) => ({ label: a.name, value: a.name }))} />
                </Form.Item>

                <Divider orientation="left">Bed Configuration</Divider>
                <Form.List name="beds">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} gutter={16} align="middle" className="mb-2">
                                    <Col span={14}>
                                        <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                                            <AutoComplete
                                                placeholder="Select Beds"
                                                options={masterBeds.map((b: any) => ({ value: b.name }))}
                                                showSearch={{
                                                    filterOption: (input, option) =>
                                                        option!.value?.toUpperCase().indexOf(input.toUpperCase()) !== -1
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={7}>
                                        <Form.Item {...restField} name={[name, 'count']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                                            <InputNumber min={1} placeholder="Qty" className="w-full" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={3} className="flex justify-center items-center">
                                        {/* Wrap the button in a Form.Item to match heights */}
                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined style={{ fontSize: '20px' }} />}
                                                onClick={() => remove(name)}
                                                className="flex items-center justify-center"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ))}
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Bed</Button>
                        </>
                    )}
                </Form.List>

                <Row gutter={16} className="mt-4">
                    <Col span={12}><Form.Item name="price" label="Base Price ($)" rules={[{ required: true }]}><InputNumber className="w-full" min={0} precision={2} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="description" label="Description"><Input.TextArea rows={1} /></Form.Item></Col>
                </Row>
            </Form>
        </Modal>
    );
};
export default CreateModal;