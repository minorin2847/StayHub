"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal, Form, Select, Slider, Radio, Row, Col, Divider, Space } from 'antd';
import { UserSearchParams } from '@/app/dashboard/user/page';
import { Role } from '@/types/Role';

type FilterModalProps  = {
  isFilterOpened: boolean;
  setIsFilterOpened: Dispatch<SetStateAction<boolean>>;
  query: UserSearchParams;
  setQuery: Dispatch<SetStateAction<UserSearchParams>>
}

export default function FilterSortModal({ isFilterOpened, setIsFilterOpened, query, setQuery }: FilterModalProps) {
  const [form] = Form.useForm();
  
  // Watch branchId to enable/populate the Hotel dropdown
  const selectedBranch = Form.useWatch('branchid', form);
  const [branches, setBranches] = useState<{value: number; label: string}[]>([]);
  const [hotels, setHotels] = useState<{ value: number; label: string }[]>([]);
  const [roles, setRoles] = useState<{value: string; label: string}[]>([]);

  useEffect(()=> {
    setBranches([
        {id: 1, name: 'Main Branch'}, 
        {id: 2, name: 'North Side'}
    ].map(i=>({label: i.name, value: i.id})));
    setRoles([
        {role: 'ADMINISTRATOR', tier: 1},
        {role: 'MANAGE_BRANCH', tier: 2}
    ].map(i=>({label: i.role, value: i.role})))
  }, [isFilterOpened])

  // Mock effect: Fetch hotels when branch changes
  useEffect(() => {
    if (selectedBranch) {
      // In a real app, call your API: getHotelsByBranch(selectedBranch)
      setHotels([
        { name: `Hotel A (Branch ${selectedBranch})`, id: 101 },
        { name: `Hotel B (Branch ${selectedBranch})`, id: 102 },
      ].map(i=>({label: i.name, value: i.id})));
    } else {
      setHotels([]);
      form.setFieldValue('hotelid', null);
    }
  }, [selectedBranch, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Split the salary array [min, max] back into separate fields for your API
      const newQuery = {
        ...query,
        ...values,
        salaryMin: values.salaryRange?.[0],
        salaryMax: values.salaryRange?.[1],
      };
      delete newQuery.salaryRange;
      setQuery(newQuery);
      setIsFilterOpened(false);
    });
  };

  return (
    <Modal
      title="Advanced options"
      open={isFilterOpened}
      onOk={handleOk}
      onCancel={()=>setIsFilterOpened(false)}
      width={700}
      okText="Apply"
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{
          ...query,
          salaryRange: [query.salaryMin ?? 0, query.salaryMax ?? 2147483647]
        }}
      >
        {/* --- FILTER SECTION --- */}
        <Divider orientation="horizontal">Filter</Divider>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item name="branchid" label="Branch">
              <Select 
              placeholder="Select Branch"
              options={branches} 
              allowClear 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="salaryRange" label="Salary Range ($)">
              <Slider range min={0} max={100000} step={5000} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hotelid" label="Hotel">
              <Select 
                placeholder="Choose Branch first" 
                disabled={!selectedBranch} 
                options={hotels}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="roles" label="Roles">
              <Select 
              mode="multiple" 
              placeholder="Select Roles"
              options={roles} 
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