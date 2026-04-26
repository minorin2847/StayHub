"use client";

import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Space,
} from "antd";
import {
  AppstoreOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("API_URL =", API_URL);
console.log("CREATE_URL =", `${API_URL}/employee/rooms/types/create`);
const CreateModal = ({
  open,
  onClose,
  onSuccess,
  amenities = [],
  beds = [],
}: any) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = () => {
    const currentValues = form.getFieldsValue();

    const isDirty = Object.keys(currentValues).some((key) => {
      const value = currentValues[key];

      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    });

    if (isDirty) {
      Modal.confirm({
        title: "Discard changes?",
        content: "You have unsaved data. Are you sure you want to close?",
        okText: "Yes, discard",
        cancelText: "Keep editing",
        onOk: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    if (!API_URL) {
      message.error("API URL is missing.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: values.name,
        size: values.size ? Number(values.size) : 0,
        capacity: values.capacity ? Number(values.capacity) : 1,
        base_price: values.base_price ? Number(values.base_price) : 0,
        price: values.base_price ? Number(values.base_price) : 0,
        description: values.description || null,
        amenities: values.amenities || [],
        beds:
          values.beds?.map((bed: any) => ({
            name: bed.name,
            count: Number(bed.count || 1),
          })) || [],
      };

      const res = await fetch(`${API_URL}/employee/rooms/types/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();

        if (res.status === 401) {
          throw new Error("You haven't logged in or your session has expired.");
        }

        if (res.status === 403) {
          throw new Error("You don't have permission to create a room type.");
        }

        throw new Error(errorText || "Failed to create room type");
      }

      message.success({
        content: "Room type created successfully!",
        className: "mt-12",
      });

      await onSuccess();

      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "Failed to create room type.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
      width={900}
      title={null}
      closeIcon={false}
      styles={{
        body: {
          padding: 0,
          overflow: "hidden",
          borderRadius: "24px",
        },
        content: {
          padding: 0,
          borderRadius: "24px",
          background: "transparent",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      <div className="bg-slate-50 flex flex-col w-full overflow-hidden rounded-[24px]">
        <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl shadow-inner">
            <AppstoreOutlined className="text-xl" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1">
              Create Room Type
            </h2>
            <p className="text-slate-500 text-sm">
              Define a room category, pricing, beds, and amenities
            </p>
          </div>
        </div>

        <div className="p-8 pb-0">
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark="optional"
              initialValues={{
                size: 100,
                capacity: 1,
                base_price: 0,
                amenities: [],
                beds: [{ name: undefined, count: 1 }],
              }}
            >
              <div className="grid grid-cols-2 gap-x-5 gap-y-1">
                <Form.Item
                  name="name"
                  label={
                    <span className="font-medium text-slate-600">
                      Room Type Name <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    size="large"
                    className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200"
                    placeholder="E.g. Deluxe Suite"
                  />
                </Form.Item>

                <Form.Item
                  name="size"
                  label={
                    <span className="font-medium text-slate-600">
                      Size
                    </span>
                  }
                >
                  <InputNumber
                    size="large"
                    min={0}
                    className="w-full rounded-xl"
                    placeholder="Room size"
                  />
                </Form.Item>

                <Form.Item
                  name="capacity"
                  label={
                    <span className="font-medium text-slate-600">
                      Capacity <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber
                    size="large"
                    min={1}
                    className="w-full rounded-xl"
                    placeholder="Number of guests"
                  />
                </Form.Item>

                <Form.Item
                  name="base_price"
                  label={
                    <span className="font-medium text-slate-600">
                      Base Price <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    className="w-full rounded-xl"
                    placeholder="Base price"
                  />
                </Form.Item>

                <div className="col-span-2">
                  <Form.Item
                    name="description"
                    label={
                      <span className="font-medium text-slate-600">
                        Description
                      </span>
                    }
                  >
                    <Input.TextArea
                      rows={4}
                      className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200 custom-scrollbar"
                      placeholder="Describe this room type..."
                    />
                  </Form.Item>
                </div>

                <div className="col-span-2">
                  <Form.Item
                    name="amenities"
                    label={
                      <span className="font-medium text-slate-600">
                        Amenities
                      </span>
                    }
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      placeholder="Select amenities"
                      className="[&>.ant-select-selector]:rounded-xl"
                      options={amenities.map((item: any) => ({
                        label: item.name,
                        value: item.name,
                      }))}
                    />
                  </Form.Item>
                </div>

                <div className="col-span-2">
                  <Form.List name="beds">
                    {(fields, { add, remove }) => (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-slate-600">
                            Beds
                          </span>

                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add({ name: undefined, count: 1 })}
                          >
                            Add Bed
                          </Button>
                        </div>

                        {fields.map(({ key, name, ...restField }) => (
                          <Space
                            key={key}
                            align="baseline"
                            className="w-full mb-3"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              rules={[
                                { required: true, message: "Select bed type" },
                              ]}
                            >
                              <Select
                                size="large"
                                placeholder="Bed type"
                                className="w-64"
                                options={beds.map((bed: any) => ({
                                  label: bed.name,
                                  value: bed.name,
                                }))}
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "count"]}
                              rules={[
                                { required: true, message: "Enter count" },
                              ]}
                            >
                              <InputNumber
                                size="large"
                                min={1}
                                placeholder="Count"
                              />
                            </Form.Item>

                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            />
                          </Space>
                        ))}
                      </div>
                    )}
                  </Form.List>
                </div>
              </div>
            </Form>
          </div>
        </div>

        <div className="mt-8 px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={submitting}
            size="large"
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 font-medium"
          >
            Reset
          </Button>

          <Button
            onClick={handleCancel}
            size="large"
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            loading={submitting}
            onClick={form.submit}
            size="large"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-md hover:shadow-lg font-semibold px-6 border-0 h-10 flex items-center"
          >
            Create Room Type
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateModal;