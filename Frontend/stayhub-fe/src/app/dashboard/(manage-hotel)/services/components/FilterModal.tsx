"use client";
import React from 'react';
import { Modal, Form, Select, Slider, Radio, Row, Col, Divider } from 'antd';

export default function FilterModal({ open, setOpen, query, setQuery, serviceTypes }: any) {
  const [form] = Form.useForm();

  const handleOk = () => {
    const values = form.getFieldsValue();
    const [min, max] = values.priceRange || [0, 5000];
    
    setQuery({
      ...query,
      type: values.type,
      minPrice: min > 0 ? min.toString() : null,
      maxPrice: max < 5000 ? max.toString() : null,
      sort: values.sort,
      order: values.order
    });
    setOpen(false);
  };

  return (
    <Modal title="Service Filters" open={open} onOk={handleOk} onCancel={() => setOpen(false)} okText="Apply Filters">
      <Form form={form} layout="vertical" initialValues={{
          type: query.type,
          priceRange: [query.minPrice ?? 0, query.maxPrice ?? 5000],
          sort: query.sort ?? 'id',
          order: query.order ?? 'ASC'
      }}>
        <Divider orientation="left">Criteria</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="type" label="Service Type">
              <Select allowClear options={serviceTypes.map((t: string) => ({ label: t, value: t }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="priceRange" label="Price Range ($)">
              <Slider range min={0} max={5000} step={50} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Sorting</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="sort" label="Sort By">
              <Radio.Group optionType="button" buttonStyle="solid">
                <Radio value="name">Name</Radio>
                <Radio value="price">Price</Radio>
                <Radio value="type">Type</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="order" label="Direction">
              <Radio.Group optionType="button" buttonStyle="solid">
                <Radio value="ASC">Asc</Radio>
                <Radio value="DESC">Desc</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}