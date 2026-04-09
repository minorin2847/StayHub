"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal, Form, Select, Slider, Radio, Row, Col, Divider } from 'antd';
import { Role } from '@/types/Role';
import { EmployeeFilterData } from '../ManageHotelUserView';

type FilterModalProps  = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  query: EmployeeFilterData;
  setQuery: Dispatch<SetStateAction<EmployeeFilterData>>;
  roles: Role[]
}

export default function FilterModal({ open, setOpen, query, setQuery, roles }: FilterModalProps) {
  const [form] = Form.useForm();
  
  const handleOk = () => {
    form.validateFields().then((values) => {
      const min = values.salaryRange?.[0]
      const max = values.salaryRange?.[1]
      const newQuery = {
        ...query,
        ...values,
        ...(min !== undefined && min !== 0 && { salaryMin: min }),
        ...(max !== undefined && max !== 100000 && { salaryMax: max }),
      };
      delete newQuery.salaryRange;
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
          salaryRange: [query.salaryMin ?? 0, query.salaryMax ?? 100000]
        }}
      >
        <Divider orientation="horizontal">Filter</Divider>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item name="salaryRange" label="Salary Range ($)">
              <Slider range min={0} max={100000} step={100} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="roles" label="Roles">
              <Select 
              mode="multiple" 
              placeholder="Select Roles"
              options={
                [...roles
                  .sort((a, b) => b.tier - a.tier)
                  .map(i=>{
                    return {
                      label: i.name.split("_").map(i=>i.charAt(0).toUpperCase()+i.slice(1).toLowerCase()).join(" "),
                      value: i.name
                    }
                  }),
                ]
              } 
              allowClear/>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="horizontal">Sort</Divider>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item name="sort" label="Sort By">
              <Radio.Group optionType="button" buttonStyle="solid">
                <Radio value="id">ID</Radio>
                <Radio value="username">User</Radio>
                <Radio value="full_name">Name</Radio>
                <Radio value="salary">Salary</Radio>
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
