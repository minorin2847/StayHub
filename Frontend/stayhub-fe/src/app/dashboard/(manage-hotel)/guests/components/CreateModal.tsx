"use client";
import React from "react";
import { Modal, Form, Input, Row, Col, message } from "antd";

const CreateModal = ({ open, onClose, onSuccess }: any) => {
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/guests/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error(await res.text());

      message.success("Guest profile created!");
      onSuccess();
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error.message || "Failed to create guest");
    }
  };

  return (
    <Modal title="Add New Guest" open={open} onCancel={onClose} onOk={form.submit} width={650}>
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="first_name" 
              label="First Name" 
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input placeholder="John" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="last_name" 
              label="Last Name" 
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input placeholder="Doe" />
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
              <Input placeholder="+1234567890" />
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* Email is optional in SQL (can be NULL) */}
            <Form.Item name="email" label="Email Address">
              <Input type="email" placeholder="john.doe@example.com" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="id_card_number" label="ID / Passport Number">
          <Input placeholder="A1234567" />
        </Form.Item>
        <Form.Item name="address" label="Home Address">
          <Input.TextArea rows={2} placeholder="123 Street, City, Country" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModal;