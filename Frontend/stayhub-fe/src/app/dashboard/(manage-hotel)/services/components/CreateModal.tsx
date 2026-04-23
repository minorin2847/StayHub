"use client";
import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  message,
  AutoComplete,
} from "antd";

const CreateModal = ({ open, onClose, onSuccess, serviceTypes }: any) => {
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/services/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        },
      );

      if (!res.ok) throw new Error(await res.text());

      message.success("Service created successfully!");
      onSuccess();
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(`Creation failed: ${error.message}`);
    }
  };

  return (
    <Modal
      title="Create New Service"
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
          <Col span={16}>
            <Form.Item
              name="name"
              label="Service Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Luxury Spa Treatment" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type"
              label="Category"
              rules={[
                {
                  required: true,
                  message: "Please select or enter a category",
                },
              ]}
            >
              <AutoComplete
                placeholder="Select or type a new category"
                options={serviceTypes.map((t: string) => ({ value: t }))}
                // Move filterOption inside showSearch
                showSearch={{
                  filterOption: (inputValue, option) =>
                    option!.value
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={3}
            placeholder="Describe the service details..."
          />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[{ required: true }]}
            >
              <InputNumber className="w-full" min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="coverimage" label="Cover Image URL">
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateModal;
