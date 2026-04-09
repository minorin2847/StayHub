"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal, Form, Select, Slider, Radio, Row, Col, Divider, Space } from 'antd';
import { Role } from '@/types/Role';
import { BranchListQuery } from '@/app/dashboard/(admin)/branches/page';

type FilterModalProps  = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  query: BranchListQuery;
  setQuery: Dispatch<SetStateAction<BranchListQuery>>
}

export default function FilterModal({ open, setOpen, query, setQuery }: FilterModalProps) {
  const [form] = Form.useForm();
  

  useEffect(()=> {
  }, [open])


  const handleOk = () => {
    form.validateFields().then((values) => {
      // Split the salary array [min, max] back into separate fields for your API
      const newQuery = {
        ...query,
        ...values,
        hotelCountMin: values.hotelRange?.[0],
        hotelCountMax: values.hotelRange?.[1],
      };
      delete newQuery.hotelRange;
      setQuery(newQuery);
      setOpen(false);
    });
  };

  return (
    <Modal
      title="Advanced options"
      open={open}
      onOk={handleOk}
      onCancel={()=>setOpen(false)}
      width={700}
      okText="Apply"
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{
          ...query,
          hotelRange: [query.hotelCountMin ?? 0, query.hotelCountMax ?? 1000]
        }}
      >
        {/* --- FILTER SECTION --- */}
        <Divider orientation="horizontal">Filter</Divider>
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Form.Item name="hotelRange" label="Hotel Count">
              <Slider range min={0} max={1000} step={1} />
            </Form.Item>
          </Col>
        </Row>

        {/* --- SORT SECTION --- */}
        <Divider orientation="horizontal">Sort</Divider>
        <Row gutter={[24, 16]}>
          <Col span={18}>
            <Form.Item name="sort" label="Sort By">
              <Radio.Group optionType="button" buttonStyle="solid">
                <Radio value="id">ID</Radio>
                <Radio value="name">Name</Radio>
                <Radio value="location">Location</Radio>
                <Radio value="hotel_count">Hotel Count</Radio>
                <Radio value="manager_name">Manager Name</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="order" label="Order">
              <Radio.Group optionType="button" buttonStyle="solid">
                <Radio value="ASC">Ascending</Radio>
                <Radio value="DESC">Descending</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};