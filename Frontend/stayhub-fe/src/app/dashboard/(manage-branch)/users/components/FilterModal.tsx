"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal, Form, Select, Slider, Radio, Row, Col, Divider, Space } from 'antd';
import { Role } from '@/types/Role';
import { Branch } from '@/types/Branch';
import { Hotel } from '@/types/Hotel';
import { EmployeeFilterData } from '../ManageBranchUserView';

type FilterModalProps  = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  query: EmployeeFilterData;
  setQuery: Dispatch<SetStateAction<EmployeeFilterData>>;
  hotels: Hotel[];
  roles: Role[]
}

export default function FilterModal({ open, setOpen, query, setQuery, hotels, roles }: FilterModalProps) {
  const [form] = Form.useForm();
  



  const handleOk = () => {
    form.validateFields().then((values) => {
      // Split the salary array [min, max] back into separate fields for your API
      const min = values.salaryRange?.[0]
      const max = values.salaryRange?.[1]
      const newQuery = {
        ...query,
        ...values,
        // Insert salaryMin ONLY if it has a value and is not 0
        ...(min !== undefined && min !== 0 && { salaryMin: min }),
        
        // Insert salaryMax ONLY if it has a value and is not 100000
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
        {/* --- FILTER SECTION --- */}
        <Divider orientation="horizontal">Filter</Divider>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item name="salaryRange" label="Salary Range ($)">
              <Slider range min={0} max={100000} step={100} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hotelid" label="Hotel">
              <Select 
                placeholder={"Select hotel"} 
              options={[...hotels.map(i=>{
                return {
                  label: i.name,
                  value: i.id
                }
              })]}
                allowClear
              />
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

        {/* --- SORT SECTION --- */}
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