import { Form, Modal, Select, Row, Col, Button } from "antd";
import React, { Dispatch, SetStateAction } from "react";
import { PolicyFilterData } from "@/types/Policy";

interface FilterModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  query: PolicyFilterData;
  setQuery: Dispatch<SetStateAction<PolicyFilterData>>;
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
      title="Filter Policies"
      open={open}
      onCancel={() => setOpen(false)}
      width={400}
      footer={[
        <Button key="reset" onClick={handleReset}>
          Reset Filter
        </Button>,
        <Button key="cancel" onClick={() => setOpen(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk} className="bg-blue-600">
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
              <Select placeholder="All Categories" allowClear size="large" className="[&_.ant-select-selector]:rounded-lg">
                <Select.Option value="Reservations">Reservations</Select.Option>
                <Select.Option value="Property">Property</Select.Option>
                <Select.Option value="General">General</Select.Option>
                <Select.Option value="Financial">Financial</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}