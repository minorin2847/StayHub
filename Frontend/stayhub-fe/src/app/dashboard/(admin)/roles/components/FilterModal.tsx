"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal, Form, Select, Slider, Radio, Row, Col, Divider, Space } from 'antd';
import { Role } from '@/types/Role';
import { Branch } from '@/types/Branch';
import { Hotel } from '@/types/Hotel';
import { RoleFilterData } from '@/app/dashboard/(admin)/roles/page';

type FilterModalProps  = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  query: RoleFilterData;
  setQuery: Dispatch<SetStateAction<RoleFilterData>>;
}

export default function FilterModal({ open, setOpen, query, setQuery }: FilterModalProps) {
  const [form] = Form.useForm();



  const handleOk = () => {
    form.validateFields().then((values) => {
      // Split the salary array [min, max] back into separate fields for your API
      const min = values.userRange?.[0]
      const max = values.userRange?.[1]
      const newQuery = {
        ...query,
        ...values,
        ...( min !== undefined && min !== 0 && {mincount: min} ),
        ...( max !== undefined && max !== 1000 && {maxcount: max} )
      };
      delete newQuery.userRange;
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
          userRange: [query.mincount ?? 0, query.maxcount ?? 1000]
        }}
      >
        {/* --- FILTER SECTION --- */}
        <Divider orientation="horizontal">Filter</Divider>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item name="tier" label="Select Tier">
              <Select 
              placeholder="Select Branch"
                options={[
                  {label: "Administrative (tier 1)", value: 1},
                  {label: "Branch management (tier 2)", value: 2},
                  {label: "Hotel management (tier 3)", value: 3},
                  {label: "Room management (tier 4)", value: 4}
                ]}
              allowClear 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="userRange" label="Role User Count">
              <Slider range min={0} max={1000} step={1} />
            </Form.Item>
          </Col>
        </Row>

        {/* --- SORT SECTION --- */}
        <Divider orientation="horizontal">Sort</Divider>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item name="sort" label="Sort By">
              <Radio.Group optionType="button" buttonStyle="solid">
                <Radio value="name">Name</Radio>
                <Radio value="tier">Tier</Radio>
                <Radio value="user_count">User Count</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
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