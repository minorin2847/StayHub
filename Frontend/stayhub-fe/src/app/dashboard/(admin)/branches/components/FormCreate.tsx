"use client";
import React, { useEffect } from "react";
import { Button, Form, Input, Modal, Select, Row, Col, message } from "antd";

const FormCreate = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (branch: any) => void;
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
      form.resetFields();
  }, [open, form]);

  const handleValuesChange = (changedValues: any) => {

  };

  const onReset = () => {
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        location: values.location,
        description: values.description,
      };

      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branch/signup`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   credentials: "include",
      //   body: JSON.stringify(payload),
      // });

      // if (!res.ok) {
      //   const errorData = await res.text();
      //   message.error(`Registration failed: ${errorData}`);
      //   return;
      // }

      message.success("User created successfully!");
      // Build a mock object to prepend to the local table quickly
      const newBranch = {
         id: Date.now(), // Fake ID temporarily until next fetch
         name: values.name,
         location: values.location,
         description: values.description,
         manager_firstname: null,
         manager_lastname: null,
         manager_email: null,
         hotel_count: 0,
         revenue: 0,
         status: "ACTIVE"
      };
      
      onSuccess(newBranch);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("An error occurred during registration.");
    }
  };

  return (
    <Modal
      width={700}
      open={open}
      onCancel={onClose}
      onOk={form.submit}
      title="Create New Branch"
      footer={[
        <Button key="reset" onClick={onReset}>
          Reset
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit}>
          Create
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
 <Form
      layout="vertical"
      form={form}
      onValuesChange={handleValuesChange}
      onFinish={handleFinish}
      className="mt-6"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please input the name!" },
            ]}
          >
            <Input placeholder="Enter branch or hotel name" />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="location"
            label="Location"
            rules={[
              { required: true, message: "Please input the location!" },
            ]}
          >
            <Input placeholder="e.g., New York, NY" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="description"
            label="Description"
            // No 'rules' array here means it is optional by default
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Provide a detailed description here..." 
              className="resize-y" // Optional Tailwind class to allow vertical resizing
            />
          </Form.Item>
        </Col>
      </Row>
      
      {/* Remember to include a submit button inside or attached to the form! */}
      {/* <Form.Item>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item> 
      */}
    </Form>
    </Modal>
  );
};

export default FormCreate;
