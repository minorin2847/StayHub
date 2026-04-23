"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Row, Col, message, Skeleton } from "antd";
import { Hotel } from "@/types/Hotel";

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  current: Hotel | null;
}

const EditModal = ({ open, onClose, onSuccess, current }: EditModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (open && current) {
      setLoading(true);
      // Use a tiny delay to ensure Modal renders Form into DOM before setting values
      setTimeout(() => {
        const formattedData = {
          name: current.name,
          branchid: current.branchid?.toString(),
          location: current.location,
          contact_email: current.contact_email,
          contact_phone: current.contact_phone,
          classification: current.classification,
          description: current.description,
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
        setLoading(false);
      }, 10);
    } else {
      form.resetFields();
    }
  }, [open, current, form]);

  const handleCancel = () => {
    const currentValues = form.getFieldsValue();
    const isDirty = Object.keys(currentValues).some(
      (key) =>
        JSON.stringify(currentValues[key]) !== JSON.stringify(initialData?.[key])
    );

    if (isDirty) {
      Modal.confirm({
        title: "Discard changes?",
        content: "You have unsaved changes. Are you sure you want to close?",
        onOk: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        branchid: values.branchid ? parseInt(values.branchid) : null,
        location: values.location,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone,
        classification: values.classification || 0,
        description: values.description || "",
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/hotels/edit/${current?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        message.error(`Update failed: ${errorData}`);
        return;
      }

      const responseData = await res.json();
      message.success(responseData.message || "Hotel updated successfully!");

      const updatedHotel = {
        id: current?.id,
        ...payload,
      };

      await onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("An error occurred.");
    }
  };

  return (
    <Modal
      width={700}
      open={open}
      destroyOnHidden
      onCancel={handleCancel}
      onOk={form.submit}
      title="Edit Hotel"
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
          <Form.Item name="branchid" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Hotel Name"
                rules={[{ required: true, message: "Please input the hotel name!" }]}
              >
                <Input placeholder="E.g. Azure Resort & Spa" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please input the location!" }]}
              >
                <Input placeholder="E.g. Miami, FL" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact_email" label="Contact Email">
                <Input placeholder="contact@address.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact_phone" label="Contact Phone">
                <Input placeholder="+1 (305) 555-0123" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="previewimages"
                label="Preview Images (Comma separated URLs)"
              >
                <Input placeholder="/images/hotel1.png, /images/hotel2.png" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default EditModal;
