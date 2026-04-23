"use client";
import React, { useState } from 'react';
import { Modal, Form, Radio, Row, Col, Divider, DatePicker, Button, Select, AutoComplete, Input } from 'antd';
import dayjs from 'dayjs';

export default function FilterModal({ open, setOpen, query, setQuery, rooms }: any) {
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
      status: values.status || null,
      hasReserve: values.hasReserve,
      checkinAfter: values.checkinDates ? values.checkinDates[0].format('YYYY-MM-DD') : null,
      checkinBefore: values.checkinDates ? values.checkinDates[1].format('YYYY-MM-DD') : null,
      checkoutAfter: values.checkoutDates ? values.checkoutDates[0].format('YYYY-MM-DD') : null,
      checkoutBefore: values.checkoutDates ? values.checkoutDates[1].format('YYYY-MM-DD') : null,
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
      title="Advanced Booking Filters" 
      open={open} 
      onCancel={() => setOpen(false)}
      width={600}
      footer={[
        <Button key="reset" onClick={handleReset} danger>Reset All</Button>,
        <Button key="submit" type="primary" onClick={handleOk}>Apply Filters</Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{
          status: query.status,
          hasReserve: query.hasReserve,
          sort: query.sort ?? 'checkin',
          order: query.order ?? 'ASC'
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="room_display" label="Room">
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
          <Col span={12}>
            <Form.Item name="status" label="Booking Status">
              <Select allowClear placeholder="Select Status">
                <Select.Option value="Checked-In">Checked-In</Select.Option>
                <Select.Option value="Stayed">Stayed</Select.Option>
                <Select.Option value="Checked-Out">Checked-Out</Select.Option>
                <Select.Option value="Cancelled">Cancelled</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="checkinDates" label="Check-in Range">
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>

        <Form.Item name="checkoutDates" label="Check-out Range">
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>

        <Form.Item name="hasReserve" label="Booking Type">
          <Radio.Group>
            <Radio value={null}>All</Radio>
            <Radio value="true">Online</Radio>
            <Radio value="false">Walk-in</Radio>
          </Radio.Group>
        </Form.Item>

        <Divider orientation="left">Sorting</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="sort" label="Sort By">
              <Select>
                <Select.Option value="checkin">Check-in Date</Select.Option>
                <Select.Option value="checkout">Check-out Date</Select.Option>
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