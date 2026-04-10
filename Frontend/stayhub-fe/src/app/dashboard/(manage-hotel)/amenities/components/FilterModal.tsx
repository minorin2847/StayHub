import { Amenity } from "@/types/Amenity";
import { Form, Modal, Select, Row, Col, Button } from "antd";
import React, { Dispatch, SetStateAction } from "react";

type AmenityFilterData = {
  name: string | null;
  category: string | null;
  page: string | null;
};

interface FilterModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  query: AmenityFilterData;
  setQuery: Dispatch<SetStateAction<AmenityFilterData>>;
}

export default function FilterModal({
  open,
  setOpen,
  query,
  setQuery,
}: FilterModalProps) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      setQuery({ ...query, ...values, page: "1" });
      setOpen(false);
    });
  };

  const handleReset = () => {
    form.resetFields();
    setQuery({ ...query, category: null, page: "1" });
    setOpen(false);
  };
  return (
    <Modal
      title="Filter Amenities"
      open={open}
      onOk={handleOk}
      onCancel={() => setOpen(false)}
      width={400}
      okText="Apply"
      footer={[
        <Button key="reset" onClick={handleReset}>
          Reset Filter
        </Button>,
        <Button key="cancel" onClick={() => setOpen(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Apply
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={query}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="category" label="Category">
              <Select placeholder="All Categories" allowClear>
                <Select.Option value="Outdoor & Leisure">
                  Outdoor & Leisure
                </Select.Option>
                <Select.Option value="Health & Gym">Health & Gym</Select.Option>
                <Select.Option value="Health & Wellness">
                  Health & Wellness
                </Select.Option>
                <Select.Option value="Dining">Dining</Select.Option>
                <Select.Option value="Connectivity">Connectivity</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
