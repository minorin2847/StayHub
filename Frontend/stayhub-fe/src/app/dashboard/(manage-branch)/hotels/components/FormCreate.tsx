"use client";
import React, { useEffect } from "react";
import { Button, Form, Input, Modal, Select, Row, Col, message } from "antd";


const FormCreate = ({
  open,
  onClose,
  onSuccess,
  editRecord,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (hotel: any, isEdit?: boolean) => void;
  editRecord?: any | null;
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (editRecord) {
        // Use a tiny delay to ensure Modal renders Form into DOM before setting values
        setTimeout(() => {
          form.setFieldsValue({
            name: editRecord.name,
            branchid: editRecord.branchid?.toString(),
            location: editRecord.location,
            contact_email: editRecord.contact_email,
            contact_phone: editRecord.contact_phone,
            classification: editRecord.classification,
            description: editRecord.description
          });
        }, 10);
      }
    }
  }, [open, form, editRecord]);

  const onReset = () => {
    form.resetFields();
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
        description: values.description || ""
      };

      const url = editRecord 
        ? `${process.env.NEXT_PUBLIC_API_URL}/employee/hotels/${editRecord.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/employee/hotels`;
        
      const method = editRecord ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.text();
        message.error(`${editRecord ? "Update" : "Creation"} failed: ${errorData}`);
        return;
      }

      const responseData = await res.json();
      message.success(responseData.message || `Hotel ${editRecord ? "updated" : "created"} successfully!`);
      
      const newHotel = {
         id: editRecord ? editRecord.id : responseData.hotel?.id || Date.now(),
         ...payload
      };
      
      onSuccess(newHotel, !!editRecord);
      form.resetFields();
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
      onCancel={onClose}
      onOk={form.submit}
      title={editRecord ? "Edit Hotel" : "Add New Hotel"}
      footer={[
        <Button key="reset" onClick={onReset}>
          Reset
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit}>
          {editRecord ? "Update" : "Submit"}
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
        {!editRecord && (
          <Form.Item name="password" hidden>
            <Input />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Hotel Name"
              rules={[
                { required: true, message: "Please input the hotel name!" },
              ]}
            >
              <Input placeholder="E.g. Azure Resort & Spa" />
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* Branch selector hidden as requested */}
            <Form.Item name="branchid" hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please input the location!" }]}
            >
              <Input placeholder="E.g. Miami, FL" />
            </Form.Item>
          </Col>
          <Col span={12}>
             <Form.Item
              name="contact_email"
              label="Contact Email"
            >
              <Input placeholder="contact@address.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
             <Form.Item
              name="contact_phone"
              label="Contact Phone"
            >
              <Input placeholder="+1 (305) 555-0123" />
            </Form.Item>
          </Col>
          <Col span={12}>
             <Form.Item
              name="previewimages"
              label="Preview Images (Comma separated URLs)"
            >
              <Input placeholder="/images/hotel1.png, /images/hotel1.png" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FormCreate;
