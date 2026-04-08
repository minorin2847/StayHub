"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Row, Col, message, InputNumber, Skeleton } from "antd";
import { Role } from "@/types/Role";
import { EmployeeTableData } from "../ManageHotelUserView";

interface FormEditProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  current: EmployeeTableData | null;
  roles: Role[];
}

const EditModal = ({ open, onClose, onSuccess, current, roles }: FormEditProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (open && current) {
      fetchEmployeeData(current);
    } else {
      form.resetFields();
    }
  }, [open, current]);

  const fetchEmployeeData = async (current: EmployeeTableData) => {
    setLoading(true);
    try {
      const formattedData = {
        firstname: current.firstname,
        lastname: current.lastname,
        email: current.email,
        salary: current.salary,
        roles: current.roles?.map(r => r.name) || [],
      };
      setInitialData(formattedData);
      form.setFieldsValue(formattedData);
    } catch (error) {
      message.error("Could not load employee details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const changedData: any = {};
      
      Object.keys(values).forEach((key) => {
        const newValue = values[key];
        const oldValue = initialData[key];

        if (Array.isArray(newValue)) {
            if (JSON.stringify(newValue.sort()) !== JSON.stringify(oldValue.sort())) {
                changedData[key] = newValue;
            }
        } 
        else if (newValue !== oldValue) {
          changedData[key] = newValue ?? null;
        }
      });

      if (Object.keys(changedData).length === 0) {
        message.info("No changes detected");
        onClose();
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/edit/${current?.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedData),
      });

      if (res.ok) {
        message.success("Employee updated successfully");
        onSuccess();
        onClose();
      } else {
        message.error("Update failed");
      }
    } catch (error) {
      message.error("An error occurred during update.");
    }
  };

const handleCancel = () => {
  const currentValues = form.getFieldsValue();
  const isDirty = Object.keys(currentValues).some(
    (key) => JSON.stringify(currentValues[key]) !== JSON.stringify(initialData[key])
  );

  if (isDirty) {
    Modal.confirm({
      title: 'Discard changes?',
      content: 'You have unsaved changes. Are you sure you want to close?',
      onOk: onClose,
    });
  } else {
    onClose();
  }
};

  return (
    <Modal
      width={700}
      open={open}
      onCancel={handleCancel}
      onOk={form.submit}
      title="Edit Employee Information"
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="reset" 
          onClick={() => form.setFieldsValue(initialData)}
          disabled={loading}
        >
          Reset to Original
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={form.submit}
        >
          Save Changes
        </Button>,
      ]}
    >
      {loading ? (
        <Skeleton active className="mt-6" />
      ) : (
        <Form layout="vertical" form={form} onFinish={handleFinish} className="mt-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstname" label="First Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastname" label="Last Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="email" label="Email">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roles" label="Select role(s)">
                <Select mode="multiple" allowClear options={roles.map(r => ({
                  label: r.name.split("_").map(i=>i.charAt(0).toUpperCase()+i.slice(1).toLowerCase()).join(" "),
                  value: r.name
                }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default EditModal;
