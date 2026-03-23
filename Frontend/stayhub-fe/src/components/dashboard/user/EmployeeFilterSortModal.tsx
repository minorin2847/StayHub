"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal, Form, Select, Slider, Radio, Row, Col, Divider, Space } from 'antd';
import { Role } from '@/types/Role';
import { Branch } from '@/types/Branch';
import { Hotel } from '@/types/Hotel';
import { UserSearchParams } from '@/app/dashboard/(admin)/users/AdminUserView';

type FilterModalProps  = {
  isFilterOpened: boolean;
  setIsFilterOpened: Dispatch<SetStateAction<boolean>>;
  query: UserSearchParams;
  setQuery: Dispatch<SetStateAction<UserSearchParams>>;
  branches: Branch[];
  hotels: Hotel[];
  roles: Role[]
}

export default function FilterSortModal({ isFilterOpened, setIsFilterOpened, query, setQuery, branches, hotels, roles }: FilterModalProps) {
  const [form] = Form.useForm();
  
  // Watch branchId to enable/populate the Hotel dropdown
  const selectedBranch = Form.useWatch('branchid', form);



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
              options={[...branches.map(i=>{
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
            <Form.Item name="salaryRange" label="Salary Range ($)">
              <Slider range min={0} max={100000} step={5000} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hotelid" label="Hotel">
              <Select 
                placeholder={selectedBranch ? "Select hotel" : "Choose Branch first"} 
                disabled={!selectedBranch} 
              options={[...hotels.filter(i=>i.branchid==selectedBranch).map(i=>{
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