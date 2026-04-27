"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Row, Col, message, InputNumber } from "antd";
import { FaCheckCircle, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { Branch } from "@/types/Branch";
import { Hotel } from "@/types/Hotel";
import { Role } from "@/types/Role";

const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

const CreateModal = ({
  open,
  onClose,
  onSuccess,
  branch,
  hotels,
  roles
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: any, generatedPassword?: string) => void;
  branch: Branch | undefined;
  hotels: Hotel[];
  roles: Role[]
}) => {
  const [form] = Form.useForm();
  const selectedBranch = Form.useWatch('branchid', form);
  const selectedRoles = Form.useWatch('roles', form) || [];
  const needsHotelAssignment = selectedRoles.includes("MANAGE_HOTEL");

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        password: generatePassword(),
        branchid: branch?.id,
        hotelid: undefined,
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
      branchid: branch?.id,
      hotelid: undefined,
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
        salary: values.salary,
        branchid: branch?.id,
        hotelid: values.hotelid || null,
        roles: values.roles || []
      };
      console.log(payload)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errorData = await res.text();
        message.error(`Registration failed: ${errorData}`);
        return;
      }
      const newEmployee = await res.json();
      showSuccessModal(values.username, values.password);

      onSuccess(newEmployee, values.password);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("An error occurred during registration.");
    }
  };

const showSuccessModal = (username: string, pass: string) => {
  const modal = Modal.success({
    icon: null,
    width: 400,
    okText: "Done",
    onOk: () => onClose(),
    content: <SuccessContent username={username} password={pass} />,
  });
};

const SuccessContent = ({ username, password }: any) => {
  const [showPass, setShowPass] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Username: ${username}\nPassword: ${password}`);
    message.success("Credentials copied!");
  };

  return (
    <div className="flex flex-col items-center pt-4">
      <FaCheckCircle className="text-5xl text-green-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Success!</h2>
      <p className="text-gray-500 text-center mb-6">
        Please copy the employee information below:
      </p>

      <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Credentials</span>
          <Button 
            type="text" 
            size="small" 
            icon={<MdContentCopy />} 
            onClick={copyToClipboard}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Copy
          </Button>
        </div>

        {/* Info Block */}
        <div className="p-4 font-mono text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">User:</span>
            <span className="text-gray-800 font-semibold">{username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Pass:</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-800 font-semibold">
                {showPass ? password : "••••••••"}
              </span>
              <Button 
                type="text" 
                size="small" 
                className="p-0 h-auto flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPass(!showPass)}
                icon={showPass ? <FaRegEyeSlash /> : <FaRegEye />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <Modal
      width={700}
      open={open}
      onCancel={onClose}
      onOk={form.submit}
      title="Create New User"
      footer={[
        <Button key="reset" onClick={onReset}>
          Reset
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit}>
          Submit
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
              <Input
                disabled
                placeholder="...@stayhub.com"
                addonAfter="Generated"
              />
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
              name="roles"
              label="Select role(s)"
              // rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select 
              mode="multiple"
              options={
                [...roles
                  .sort((a, b) => b.tier - a.tier)
                  .map(i=>{
                    return {
                      label: i.name.split("_").map(i=>i.charAt(0).toUpperCase()+i.slice(1).toLowerCase()).join(" "),
                      value: i.name
                    }
                  }),
                ]
              }
              allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="branchid"
              label="Select branch"
              // rules={[{ required: true, message: "Please select a branch!" }]}
            >
              <Select
              defaultValue={branch?.name}
              options={[{
                  label: branch?.name,
                  value: branch?.id
                }
              ]}
              disabled
              allowClear
              />

            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hotelid"
              label="Select hotel"
              rules={
                needsHotelAssignment
                  ? [{ required: true, message: "Please assign a hotel for Manage Hotel role!" }]
                  : undefined
              }
            >
              <Select 
              placeholder={selectedBranch ? "Select hotel" : "No branch available"}
              options={[...hotels.filter(i=>i.branchid==selectedBranch).map(i=>{
                return {
                  label: i.name,
                  value: i.id
                }
              })]}
              disabled={!selectedBranch}
              allowClear
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="salary"
              label="Salary"
              rules={[{ required: true, message: "Please input salary!" }]}
              initialValue={1000}
            >
              <InputNumber  className="!w-full" min={100} max={10000} defaultValue={1000} step={10} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateModal;
