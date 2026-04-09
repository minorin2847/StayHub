"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Row, Col, message, InputNumber, Skeleton } from "antd";
import { Branch } from "@/types/Branch";
import { Hotel } from "@/types/Hotel";
import { Role } from "@/types/Role";
import { Employee } from "@/types/Employee";
import { RoleTableData } from "../page";

interface FormEditProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  current: RoleTableData | null;
}

const EditModal = ({ open, onClose, onSuccess, current }: FormEditProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null); // Store original data here

  // Fetch employee data when modal opens
  useEffect(() => {
    if (open && current) {
      fetchRoleData();
    } else {
      form.resetFields();
    }
  }, [open, current]);

  const fetchRoleData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/roles/get/${current?.name}`, {
        method: "GET",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch role!");
      const data: Role = await res.json();
      const formattedData = {
        name: data.name,
        tier: data.tier
      };
      setInitialData(formattedData); // Save for comparison later
      // Map API data to Form fields
      form.setFieldsValue(formattedData);

    } catch (error) {
      message.error("Could not load role details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values: any) => {
    try {
        // 1. Filter the payload to only include changed keys
      const changedData: any = {};
      
      Object.keys(values).forEach((key) => {
        const newValue = values[key];
        const oldValue = initialData[key];

        // Special handling for the roles array (compare as strings)
        if (Array.isArray(newValue)) {
            if (JSON.stringify(newValue.sort()) !== JSON.stringify(oldValue.sort())) {
                changedData[key] = newValue;
            }
        } 
        // Standard comparison for strings, numbers, and nulls
        else if (newValue !== oldValue) {
          changedData[key] = newValue ?? null;
        }
      });

      // 2. If nothing changed, just close the modal
      if (Object.keys(changedData).length === 0) {
        message.info("No changes detected");
        onClose();
        return;
      }

      console.log("Submitting changes:", changedData);


      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/roles/edit/${current?.name}`, {
        method: "PATCH", // or POST depending on your backend
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedData),
      });

      if (res.ok) {
        message.success("Role updated successfully");
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
      title="Edit Role Information"
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
              <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tier" label="Select branch">
                <Select allowClear
                  options={[
                  {label: "Administrative (tier 1)", value: 1},
                  {label: "Branch management (tier 2)", value: 2},
                  {label: "Hotel management (tier 3)", value: 3},
                  {label: "Room management (tier 4)", value: 4}
                ]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default EditModal;