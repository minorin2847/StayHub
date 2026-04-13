"use client";
import { Form, Modal, message, Button, Input, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import { Policy } from "@/types/Policy";

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  current: Policy | null;
}

export default function EditModal({
  open,
  onClose,
  onSuccess,
  current,
}: EditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (open && current) {
      setInitialData(current);
      form.setFieldsValue(current);
    } else {
      form.resetFields();
    }
  }, [open, current, form]);

  const handleFinish = async (values: any) => {
    try {
      const changedData: any = {};
      Object.keys(values).forEach((key) => {
        if (values[key] !== initialData[key]) changedData[key] = values[key];
      });

      if (Object.keys(changedData).length === 0) {
        message.info("No changes detected");
        return onClose();
      }

      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/policies/edit/${current?.name}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changedData),
        },
      );

      if (res.ok) {
        message.success("Policy updated successfully");
        await onSuccess();
        onClose();
      } else {
        const errText = await res.text();
        message.error(`Failed to update: ${errText}`);
      }
    } catch (error) {
      message.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      width={600}
      open={open}
      onCancel={onClose}
      title={
        <div className="mb-2">
          <h2 className="text-[22px] font-bold text-slate-800 leading-tight">
            Edit Policy
          </h2>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Update the details for your property guidelines.
          </p>
        </div>
      }
      footer={[
        <Button
          key="cancel"
          type="text"
          onClick={onClose}
          className="font-semibold text-slate-600 px-6"
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={form.submit}
          className="font-semibold bg-blue-600 px-6 rounded-lg"
        >
          Save Policy
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        className="mt-6 flex flex-col gap-y-2"
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label={
            <span className="font-semibold text-slate-700 text-sm">
              Policy Name
            </span>
          }
        >
          <Input
            disabled
            size="large"
            className="rounded-xl border-slate-200 bg-slate-50"
          />
        </Form.Item>
        <Form.Item
          name="description"
          label={
            <span className="font-semibold text-slate-700 text-sm">
              Description
            </span>
          }
          rules={[{ required: true }]}
        >
          <Input.TextArea
            rows={4}
            size="large"
            className="rounded-xl border-slate-200"
          />
        </Form.Item>
        <div className="flex gap-4">
          <Form.Item
            name="category"
            label={
              <span className="font-semibold text-slate-700 text-sm">
                Category
              </span>
            }
            rules={[{ required: true }]}
            className="flex-1"
          >
            <Select
              size="large"
              className="[&_.ant-select-selector]:rounded-xl"
            >
              <Select.Option value="Reservations">Reservations</Select.Option>
              <Select.Option value="Property">Property</Select.Option>
              <Select.Option value="General">General</Select.Option>
              <Select.Option value="Financial">Financial</Select.Option>
            </Select>
          </Form.Item>
          {/* Nút Switch cho Status */}
          <Form.Item
            name="status"
            label={
              <span className="font-semibold text-slate-700 text-sm">
                Status
              </span>
            }
            valuePropName="checked"
          >
            <div className="flex items-center gap-2 mt-2">
              <Switch />
              <span className="text-slate-600">Active</span>
            </div>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
