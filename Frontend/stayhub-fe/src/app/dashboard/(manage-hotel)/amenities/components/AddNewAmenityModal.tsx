"use client";

import { Button, Form, Input, Modal, Select, message } from "antd";
import React, { useEffect } from "react";
// Import các icon mẫu từ react-icons (Thay đổi tùy theo bộ icon bạn đang dùng)
import { 
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling 
} from "react-icons/fa";

interface AddNewAmenityModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
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

export default function AddNewAmenityModal({
  open,
  onClose,
  onCreated,
}: AddNewAmenityModalProps) {
  const [form] = Form.useForm();
  
  // Theo dõi giá trị icon đang được chọn để đổi màu active
  const selectedIcon = Form.useWatch("icon", form);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = async (values: any) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/amenities/create`,
        {
          method: "POST",
          credentials: "include", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      
      if (res.ok) {
        message.success("New amenity created globally!");
        onCreated();
      } else {
        const errorText = await res.text();
        console.error("Backend Error:", errorText);
        message.error(`Lỗi: ${errorText}`); 
      }
    } catch (error) {
      console.error("Network Error:", error);
      message.error("Không thể kết nối đến server");
    }
  };

  const modalTitle = (
    <div className="mb-2">
      <h2 className="text-[22px] font-bold text-slate-800 leading-tight">Create Brand New Amenity</h2>
      <p className="text-sm text-slate-500 font-normal mt-1">Define a new experience for your guests</p>
    </div>
  );

  return (
    <Modal
      width={520}
      open={open}
      onCancel={onClose}
      title={modalTitle}
      className="custom-amenity-modal"
      footer={[
        <Button 
          key="cancel" 
          type="text"
          onClick={onClose} 
          className="font-semibold text-slate-600 hover:text-slate-800 px-6 h-10"
        >
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={form.submit}
          className="font-semibold bg-blue-600 hover:bg-blue-700 px-6 h-10 rounded-lg shadow-sm"
        >
          Create Amenity
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        className="mt-6 flex flex-col gap-y-1"
        requiredMark={false} // Tắt dấu sao đỏ mặc định của Antd để giống UI
      >
        <Form.Item
          name="name"
          label={<span className="font-semibold text-slate-700 text-sm">Amenity Name</span>}
          rules={[{ required: true, message: "Please enter amenity name" }]}
        >
          <Input 
            size="large" 
            placeholder="e.g. Executive Lounge Access" 
            className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500 py-2.5 shadow-sm"
          />
        </Form.Item>

        <Form.Item
          name="category"
          label={<span className="font-semibold text-slate-700 text-sm">Category</span>}
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select 
            size="large" 
            placeholder="Select a category"
            className="[&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:border-slate-200 [&_.ant-select-selector]:shadow-sm [&_.ant-select-selection-item]:leading-[40px] h-[42px]"
          >
            <Select.Option value="Outdoor & Leisure">Outdoor & Leisure</Select.Option>
            <Select.Option value="Health & Gym">Health & Gym</Select.Option>
            <Select.Option value="Health & Wellness">Health & Wellness</Select.Option>
            <Select.Option value="Dining">Dining</Select.Option>
            <Select.Option value="Connectivity">Connectivity</Select.Option>
          </Select>
        </Form.Item>

        {/* Custom Icon Picker Field */}
        <Form.Item
          name="icon"
          label={<span className="font-semibold text-slate-700 text-sm">Select Icon</span>}
          rules={[{ required: true, message: "Please select an icon" }]}
        >
          {/* Lưới Grid hiển thị Icon */}
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
