"use client";
import React, { useState } from 'react';
import { Modal, Form, Radio, Row, Col, Divider, Button, Select, AutoComplete, Input } from 'antd';

export default function ReserveFilterModal({ open, setOpen, query, setQuery, rooms }: any) {
  const [form] = Form.useForm();
  const [roomOptions, setRoomOptions] = useState<any[]>([]);

  const handleRoomSearch = (searchText: string) => {
    const filtered = rooms
      .filter((r: any) => r.name.toLowerCase().includes(searchText.toLowerCase()))
      .map((r: any) => ({ label: r.name, value: r.name, id: r.id }));
    setRoomOptions(filtered);
  };

  const handleOk = () => {
    const values = form.getFieldsValue();
    setQuery({
      ...query,
      roomId: values.roomId || null,
      overallStatus: values.overallStatus || null,
      bookingStatus: values.bookingStatus || null,
      paymentStatus: values.paymentStatus || null,
      sort: values.sort,
      order: values.order,
      page: '1'
    });
    setOpen(false);
  };

  const handleReset = () => {
    form.resetFields();
    handleOk();
  };

  return (
    <Modal 
      title="Advanced Reserve Filters" 
      open={open} 
      onCancel={() => setOpen(false)}
      width={600}
      footer={[
        <Button key="reset" onClick={handleReset} danger>Reset All</Button>,
        <Button key="submit" type="primary" onClick={handleOk}>Apply Filters</Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{
          overallStatus: query.overallStatus,
          bookingStatus: query.bookingStatus,
          paymentStatus: query.paymentStatus,
          sort: query.sort ?? 'created_at',
          order: query.order ?? 'DESC'
      }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="room_display" label="Contains Room">
              <AutoComplete
                options={roomOptions}
                showSearch={{ onSearch: handleRoomSearch }}
                onSelect={(val, opt) => form.setFieldsValue({ roomId: opt.id })}
                placeholder="Search Room..."
                allowClear
                onClear={() => form.setFieldsValue({ roomId: null })}
              />
            </Form.Item>
            <Form.Item name="roomId" hidden><Input /></Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="overallStatus" label="Overall Status">
              <Select allowClear placeholder="Select">
                <Select.Option value="Pending">Pending</Select.Option>
                <Select.Option value="Awaiting Confirmation">Awaiting</Select.Option>
                <Select.Option value="Confirmed">Confirmed</Select.Option>
                <Select.Option value="Cancelled">Cancelled</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bookingStatus" label="Any Room Status">
              <Select allowClear placeholder="Select">
                <Select.Option value="Pending">Pending</Select.Option>
                <Select.Option value="Confirmed">Confirmed</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paymentStatus" label="Any Payment Status">
              <Select allowClear placeholder="Select">
                <Select.Option value="Unpaid">Unpaid</Select.Option>
                <Select.Option value="Paid">Paid</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Sorting</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="sort" label="Sort By">
              <Select>
                <Select.Option value="created_at">Created Date</Select.Option>
                <Select.Option value="price">Total Price</Select.Option>
                <Select.Option value="guest">Guest Name</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="order" label="Direction">
              <Radio.Group optionType="button">
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