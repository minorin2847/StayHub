"use client";
import React from 'react';
import { Modal, Form, Select, Radio, Row, Col, Divider, Button } from 'antd';

export default function FilterModal({ open, setOpen, query, setQuery, roomTypes }: any) {
    const [form] = Form.useForm();

    const handleOk = () => {
        const values = form.getFieldsValue();
        const updatedQuery = { ...query };

        // 1. Handle Room Type (Remove if empty/undefined)
        if (values.typeId) {
            updatedQuery.typeId = values.typeId;
        } else {
            delete updatedQuery.typeId;
        }

        // 2. Handle Sort (Remove if default 'id')
        if (values.sort && values.sort !== 'id') {
            updatedQuery.sort = values.sort;
        } else {
            delete updatedQuery.sort;
        }

        // 3. Handle Order (Remove if default 'ASC')
        if (values.order && values.order !== 'ASC') {
            updatedQuery.order = values.order;
        } else {
            delete updatedQuery.order;
        }

        // Optional but recommended: reset to page 1 whenever filters change
        delete updatedQuery.page;

        setQuery(updatedQuery);
        setOpen(false);
    };

    const handleReset = () => {
        // Reset the visual form fields to absolute defaults
        form.setFieldsValue({
            typeId: undefined,
            sort: 'id',
            order: 'ASC'
        });

        // Strip the specific filter parameters from the URL/query state
        const updatedQuery = { ...query };
        delete updatedQuery.typeId;
        delete updatedQuery.sort;
        delete updatedQuery.order;
        delete updatedQuery.page; // Reset page on clear

        setQuery(updatedQuery);
        setOpen(false);
    };

    return (
        <Modal
            title="Room Filters"
            open={open}
            onCancel={() => setOpen(false)}
            footer={[
                <Button key="reset" onClick={handleReset}>
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
                    typeId: query.typeId || undefined,
                    sort: query.sort || 'id',
                    order: query.order || 'ASC'
                }}
            >
                <Divider orientation="left">Criteria</Divider>
                <Form.Item name="typeId" label="Room Type">
                    <Select
                        allowClear
                        placeholder="Select a room type"
                        showSearch={{
                            filterOption: (input, option) =>
                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                        }}
                        options={roomTypes.map((t: any) => ({
                            label: t.name,
                            value: t.id,
                        }))}
                    />
                </Form.Item>

                <Divider orientation="left">Sorting</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="sort" label="Sort By">
                            <Radio.Group optionType="button" buttonStyle="solid">
                                <Radio value="id">ID</Radio>
                                <Radio value="name">Name</Radio>
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