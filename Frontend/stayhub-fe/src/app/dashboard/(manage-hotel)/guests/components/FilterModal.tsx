"use client";
import React from 'react';
import { Modal, Form, Slider, Radio, Row, Col, Divider, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';

export default function FilterModal({ open, setOpen, query, setQuery }: any) {
  const [form] = Form.useForm();

  // 1. Define your default values in one place
  const defaults = {
    visitRange: [0, 100],
    lastStayDates: null,
    sort: 'id',
    order: 'ASC'
  };

  const handleOk = () => {
    const values = form.getFieldsValue();
    const [minV, maxV] = values.visitRange || [0, 100];
    const stayDates = values.lastStayDates;
    
    setQuery({
      ...query,
      minVisit: minV > 0 ? minV.toString() : null,
      maxVisit: maxV < 100 ? maxV.toString() : null,
      fromLastStay: stayDates ? stayDates[0].format('YYYY-MM-DD') : null,
      toLastStay: stayDates ? stayDates[1].format('YYYY-MM-DD') : null,
      sort: values.sort,
      order: values.order
    });
    setOpen(false);
  };

  // 2. The Reset logic
  const handleReset = () => {
    form.setFieldsValue(defaults);
    // Optional: If you want the reset to apply immediately to the table:
    // handleOk(); 
  };

  return (
    <Modal 
      title="Guest Search Filters" 
      open={open} 
      onCancel={() => setOpen(false)}
      // 3. Custom footer to include the Reset button
      footer={[
        <Button key="reset" onClick={handleReset} danger>
          Reset to Default
        </Button>,
        <Button key="cancel" onClick={() => setOpen(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Apply Filters
        </Button>,
      ]}
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{
          visitRange: [query.minVisit ?? 0, query.maxVisit ?? 100],
          lastStayDates: query.fromLastStay ? [dayjs(query.fromLastStay), dayjs(query.toLastStay)] : null,
          sort: query.sort ?? 'id',
          order: query.order ?? 'ASC'
        }}
      >
        <Divider orientation="left">Activity</Divider>
        <Form.Item name="visitRange" label="Total Visits (Stay Count)">
          <Slider range min={0} max={100} />
        </Form.Item>
        <Form.Item name="lastStayDates" label="Last Stay Date Range">
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>

        <Divider orientation="left">Sorting</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="sort" label="Sort By">
              <Radio.Group optionType="button" buttonStyle="solid">
                <Radio value="name">Name</Radio>
                <Radio value="bookings">Visits</Radio>
                <Radio value="recent">Recent</Radio>
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