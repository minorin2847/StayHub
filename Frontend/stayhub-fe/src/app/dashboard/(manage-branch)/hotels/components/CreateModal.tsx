"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Row, Col, Upload, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";

const CreateModal = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  const onReset = () => {
    form.resetFields();
    setFileList([]);
  };

  const uploadHotelImages = async (hotelId: number) => {
    if (!fileList.length) return;

    for (const file of fileList) {
      const originFile = file.originFileObj;
      if (!originFile) continue;

      const formData = new FormData();
      formData.append("image", originFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/hotels/${hotelId}/images`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Upload failed for ${file.name}`);
      }
    }
  };

const handleFinish = async (values: any) => {
  try {
    setSubmitting(true);

    const payload = {
      name: values.name,
      branchid: values.branchid ? parseInt(values.branchid, 10) : null,
      location: values.location,
      contact_email: values.contact_email || null,
      contact_phone: values.contact_phone || null,
      classification: values.classification || 0,
      description: values.description || "",
    };
    console.log("API =", process.env.NEXT_PUBLIC_API_URL);
    const createRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/employee/hotels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    if (!createRes.ok) {
      const errorText = await createRes.text();
      message.error(`Creation failed: ${errorText}`);
      return;
    }

    const responseData = await createRes.json();
    const hotelId = responseData.hotel?.id;

    if (!hotelId) {
      message.error("Không lấy được hotelId sau khi tạo hotel.");
      return;
    }

    for (const file of fileList) {
      const originFile = file.originFileObj;
      if (!originFile) continue;

      const formData = new FormData();
      formData.append("image", originFile);

      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/hotels/${hotelId}/images`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(errorText || `Upload failed: ${file.name}`);
      }
    }

    message.success("Hotel created successfully!");
    await onSuccess();
    form.resetFields();
    setFileList([]);
    onClose();
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || "An error occurred.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <Modal
      width={700}
      open={open}
      destroyOnHidden
      onCancel={onClose}
      onOk={form.submit}
      title="Add New Hotel"
      confirmLoading={submitting}
      footer={[
        <Button key="reset" onClick={onReset} disabled={submitting}>
          Reset
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit} loading={submitting}>
          Submit
        </Button>,
        <Button key="cancel" onClick={onClose} disabled={submitting}>
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
          <Col span={24}>
            <Form.Item label="Preview Images">
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false}
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                accept="image/*"
              >
                {fileList.length >= 8 ? null : <div>Upload</div>}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateModal;