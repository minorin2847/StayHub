"use client";
import React, { useEffect } from "react";
import { Button, Form, Input, Modal, Select, Row, Col, message } from "antd";

const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

const FormCreate = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (branch: any, generatedPassword?: string) => void;
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        password: generatePassword(),
      });
    } else {
      form.resetFields();
    }
  }, [open, form]);

  const handleValuesChange = (changedValues: any) => {
    if ("username" in changedValues) {
      form.setFieldsValue({
        email: changedValues.username
          ? `${changedValues.username}@stayhub.com`
          : "",
      });
    }
  };

  const onReset = () => {
    form.resetFields();
    form.setFieldsValue({
      password: generatePassword(),
    });
  };

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        username: values.username,
        password: values.password,
        firstname: values.firstName,
        lastname: values.lastName,
        email: values.email,
        roles: [values.role],
        role: values.role, // Some versions might expect singular role
        hotelid: values.hotelId === 'none' ? null : parseInt(values.hotelId),
        branchid: values.branchId === 'none' ? null : parseInt(values.branchId),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branch/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.text();
        message.error(`Registration failed: ${errorData}`);
        return;
      }

      message.success("User created successfully!");
      // Build a mock object to prepend to the local table quickly
      const newBranch = {
         id: Date.now(), // Fake ID temporarily until next fetch
         username: values.username,
         firstname: values.firstName,
         lastname: values.lastName,
         email: values.email,
         branchid: payload.branchid,
         hotelid: payload.hotelid,
         role: values.role,
         roles: [{ role: values.role }],
         _generatedPassword: values.password
      };
      
      onSuccess(newBranch, values.password);
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
        <Form.Item name="password" hidden>
            <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please input the username!" },
              ]}
            >
              <Input placeholder="admin" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email">
              <Input disabled placeholder="...@stayhub.com" addonAfter="Generated" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "Please input first name!" }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Please input last name!" }]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
             <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select placeholder="Select role">
                <Select.Option value="MANAGE_BRANCH">Branch Management</Select.Option>
                <Select.Option value="MANAGE_HOTEL">Hotel Management</Select.Option>
                <Select.Option value="MANAGE_ROOM">Room Management</Select.Option>
                <Select.Option value="PROCESS_PAYMENT">Payment Management</Select.Option>
                <Select.Option value="MANAGE_SERVICE">Service Management</Select.Option>
                <Select.Option value="MANAGE_REVIEW">Review Management</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
             <Form.Item
              name="branchId"
              label="Branch"
              rules={[{ required: true, message: "Please select a branch!" }]}
            >
              <Select placeholder="Select branch">
                <Select.Option value="none">None</Select.Option>
                <Select.Option value="1">Branch 1</Select.Option>
                <Select.Option value="2">Branch 2</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hotelId"
              label="Assigned Hotel"
              rules={[{ required: true, message: "Please select a hotel!" }]}
            >
              <Select placeholder="Select hotel">
                <Select.Option value="none">None</Select.Option>
                <Select.Option value="1">Hotel 1</Select.Option>
                <Select.Option value="2">Hotel 2</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormCreate;
