"use client";
import { Form, Modal, message, Button, Input, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import { 
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling 
} from "react-icons/fa";

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const AVAILABLE_ICONS = [
  { name: "FaWifi", component: FaWifi },
  { name: "FaSwimmer", component: FaSwimmer },
  { name: "FaLeaf", component: FaLeaf },
  { name: "FaCoffee", component: FaCoffee },
  { name: "FaCar", component: FaCar },
  { name: "FaTv", component: FaTv },
  { name: "FaSnowflake", component: FaSnowflake },
  { name: "FaPaw", component: FaPaw },
  { name: "FaWineBottle", component: FaWineBottle },
  { name: "FaSmile", component: FaSmile },
  { name: "FaTshirt", component: FaTshirt },
  { name: "FaGlassMartiniAlt", component: FaGlassMartiniAlt },
  { name: "FaSmokingBan", component: FaSmokingBan },
  { name: "FaUmbrella", component: FaUmbrella },
  { name: "FaDoorClosed", component: FaDoorClosed },
  { name: "FaSuitcaseRolling", component: FaSuitcaseRolling },
];

export default function CreateModal({
  open,
  onClose,
  onSuccess,
}: CreateModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const selectedIcon = Form.useWatch("icon", form);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = async (values: any) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/policies/create`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            category: values.category || "General",
          }),
        },
      );

      if (res.ok) {
        message.success("Policy created successfully");
        await onSuccess();
        onClose();
      } else {
        const errText = await res.text();
        message.error(`Failed to create: ${errText}`);
      }
    } catch (error) {
      console.error(error);
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
            Add New Policy
          </h2>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Define the details for your property guidelines.
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
          Add Policy
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        className="mt-6 flex flex-col gap-y-2"
        requiredMark={false}
        initialValues={{ category: "General" }}
      >
        <Form.Item
          name="name"
          label={
            <span className="font-semibold text-slate-700 text-sm">
              Policy Name
            </span>
          }
          rules={[{ required: true, message: "Please enter policy name" }]}
        >
          <Input
            size="large"
            className="rounded-xl border-slate-200"
            placeholder="e.g. Standard Cancellation Policy"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <span className="font-semibold text-slate-700 text-sm">
              Description
            </span>
          }
          rules={[
            { required: true, message: "Please enter policy description" },
          ]}
        >
          <Input.TextArea
            rows={4}
            size="large"
            className="rounded-xl border-slate-200"
            placeholder="Enter policy details and terms..."
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


        </div>

        <Form.Item
          name="icon"
          label={<span className="font-semibold text-slate-700 text-sm">Select Icon</span>}
          rules={[{ required: true, message: "Please select an icon" }]}
        >
          <div className="grid grid-cols-8 gap-2">
            {AVAILABLE_ICONS.map((IconObj) => {
              const isSelected = selectedIcon === IconObj.name;
              return (
                <button
                  key={IconObj.name}
                  type="button"
                  onClick={() => form.setFieldValue("icon", IconObj.name)}
                  className={`
                    flex items-center justify-center h-12 w-full rounded-xl border text-xl transition-all duration-200
                    ${isSelected 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" 
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-500 hover:bg-slate-50"
                    }
                  `}
                >
                  <IconObj.component />
                </button>
              );
            })}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
