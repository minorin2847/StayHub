"use client";

import React, { Dispatch, SetStateAction } from "react";
import { Modal, Form, Input, Row, Col } from "antd";
import { HotelFilterData } from "../page";

type FilterModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  query: HotelFilterData;
  setQuery: Dispatch<SetStateAction<HotelFilterData>>;
};

export default function FilterModal({
  open,
  setOpen,
  query,
  setQuery,
}: FilterModalProps) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newQuery: HotelFilterData = {
        ...query,
        ...values,
      };
      setQuery(newQuery);
      setOpen(false);
    });
  };

  return (
    <Modal
      title="Filter Hotels"
      open={open}
      onOk={handleOk}
      onCancel={() => setOpen(false)}
      width={700}
      okText="Apply"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...query,
        }}
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item name="name" label="Hotel Name">
              <Input placeholder="Search by name..." allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
