"use client";
import React from 'react';
import { Modal, Form, Select, Slider, Radio, Row, Col, Divider, Button } from 'antd';
import { RoomTypeFilterData } from '../page';
import { Amenity } from '@/types/Amenity';
import { Bed } from '@/types/Bed';

interface FilterModalProps {
    open: boolean;
    setOpen: (open: boolean) => void; 
    query: RoomTypeFilterData;
    setQuery: (query: RoomTypeFilterData) => void;
    masterAmenities: Amenity[];
    masterBeds: Bed[];
}

// Define the default filter state
const DEFAULT_FILTERS = {
    sizeRange: [0, 1000],
    priceRange: [0, 10000],
    capRange: [0, 20],
    totalBedsRange: [0, 100],
    amenities: [],
    beds: [],
    sort: 'name',
    order: 'ASC'
};

export default function FilterModal({ open, setOpen, query, setQuery, masterAmenities, masterBeds }: FilterModalProps) {
    const [form] = Form.useForm();

    const handleReset = () => {
        form.setFieldsValue(DEFAULT_FILTERS);
    };

    const handleOk = () => {
        const values = form.getFieldsValue();
        
        // Helper to check if value should be applied or set to null/default
        const applyIfDiff = (val: any, def: any) => (val === def ? null : val?.toString());
        const applyArray = (val: any[]) => (val && val.length > 0 ? val : null);

        const newQuery: RoomTypeFilterData = {
            ...query,
            // Only apply if the slider ranges differ from the maximum/minimum defaults
            minSize: values.sizeRange?.[0] !== DEFAULT_FILTERS.sizeRange[0] ? values.sizeRange[0].toString() : null,
            maxSize: values.sizeRange?.[1] !== DEFAULT_FILTERS.sizeRange[1] ? values.sizeRange[1].toString() : null,
            
            minPrice: values.priceRange?.[0] !== DEFAULT_FILTERS.priceRange[0] ? values.priceRange[0].toString() : null,
            maxPrice: values.priceRange?.[1] !== DEFAULT_FILTERS.priceRange[1] ? values.priceRange[1].toString() : null,
            
            minCapacity: values.capRange?.[0] !== DEFAULT_FILTERS.capRange[0] ? values.capRange[0].toString() : null,
            maxCapacity: values.capRange?.[1] !== DEFAULT_FILTERS.capRange[1] ? values.capRange[1].toString() : null,
            
            minTotalBeds: values.totalBedsRange?.[0] !== DEFAULT_FILTERS.totalBedsRange[0] ? values.totalBedsRange[0].toString() : null,
            maxTotalBeds: values.totalBedsRange?.[1] !== DEFAULT_FILTERS.totalBedsRange[1] ? values.totalBedsRange[1].toString() : null,

            // Multi-selects
            amenities: applyArray(values.amenities),
            beds: applyArray(values.beds),

            // Sorting
            sort: values.sort !== DEFAULT_FILTERS.sort ? values.sort : null,
            order: values.order !== DEFAULT_FILTERS.order ? values.order : null,
        };

        setQuery(newQuery);
        setOpen(false);
    };

    return (
        <Modal 
            title="Filter Room Types" 
            open={open} 
            onOk={handleOk} 
            onCancel={() => setOpen(false)} 
            width={650}
            okText="Apply Filters"
            // Custom footer to include the Reset button
            footer={[
                <Button key="reset" onClick={handleReset} className="float-left">
                    Reset to Defaults
                </Button>,
                <Button key="back" onClick={() => setOpen(false)}>
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
                    ...query,
                    sizeRange: [Number(query.minSize) || 0, Number(query.maxSize) || 1000],
                    priceRange: [Number(query.minPrice) || 0, Number(query.maxPrice) || 10000],
                    capRange: [Number(query.minCapacity) || 0, Number(query.maxCapacity) || 20],
                    totalBedsRange: [Number(query.minTotalBeds) || 0, Number(query.maxTotalBeds) || 100],
                    sort: query.sort ?? DEFAULT_FILTERS.sort,
                    order: query.order ?? DEFAULT_FILTERS.order,
                    amenities: query.amenities ?? [],
                    beds: query.beds ?? []
                }}
            >
                <Divider orientation="left">Room Specs</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="sizeRange" label="Size Range (m²)">
                            <Slider range min={0} max={1000} step={10} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="priceRange" label="Price Range ($)">
                            <Slider range min={0} max={10000} step={100} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="capRange" label="Guest Capacity">
                            <Slider range min={0} max={20} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="totalBedsRange" label="Total Beds in Room">
                            <Slider range min={0} max={100} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Included Features</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="amenities" label="Amenities (Must have all)">
                            <Select 
                                mode="multiple" 
                                allowClear
                                placeholder="Select Amenities"
                                options={masterAmenities.map((a: any) => ({ label: a.name, value: a.name }))} 
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="beds" label="Bed Types (Has any of)">
                            <Select 
                                mode="multiple" 
                                allowClear
                                placeholder="Select Bed Types"
                                options={masterBeds.map((b: Bed) => ({ label: b.name, value: b.name }))} 
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Sorting</Divider>
                <Row gutter={16}>
                    <Col span={14}>
                        <Form.Item name="sort" label="Sort By">
                            <Radio.Group optionType="button" buttonStyle="solid">
                                <Radio value="name">Name</Radio>
                                <Radio value="price">Price</Radio>
                                <Radio value="size">Size</Radio>
                                <Radio value="totalBeds">Beds</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={10}>
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