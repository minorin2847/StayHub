"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Row, Col, message, InputNumber } from "antd";
import { FaCheckCircle, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";


const FormCreate = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [form] = Form.useForm();
  const selectedBranch = Form.useWatch('branchid', form);

  useEffect(() => {
    form.resetFields();
  }, [open, form]);


  const onReset = () => {
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        tier: values.tier
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/roles/add`,
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
        message.error(`Failed to add role: ${errorData}`);
        return;
      }
      onSuccess();
      form.resetFields();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("An error occurred during role addition.");
    }
  };



  return (
    <Modal
      width={700}
      open={open}
      onCancel={onClose}
      onOk={form.submit}
      title="Create New Role"
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
        onFinish={handleFinish}
        className="mt-6"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Role Name"
              rules={[
                { required: true, message: "Please input the role name!" },
              ]}
            >
              <Input
                placeholder="MANAGE_XXX"
                onInput={e => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase()}
              />
            </Form.Item>
          </Col>


          <Col span={12}>
            <Form.Item
              name="tier"
              label="Select Tier"
              rules={[{ required: true, message: "Please select your role tier!" }]}
            >
              <Select
                options={[
                  {label: "Administrative (tier 1)", value: 1},
                  {label: "Branch management (tier 2)", value: 2},
                  {label: "Hotel management (tier 3)", value: 3},
                  {label: "Room management (tier 4)", value: 4}
                ]}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

      </Form>
    </Modal>
  );
};

export default FormCreate;
