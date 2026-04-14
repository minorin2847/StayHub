import { Modal, Form, Select, Button, Slider } from "antd";
import { Dispatch, SetStateAction, useEffect } from "react";
import { GlobalBedFilterData } from "../AdminBedView"; // Adjust import path

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    query: GlobalBedFilterData;
    setQuery: Dispatch<SetStateAction<GlobalBedFilterData>>;
}

export default function FilterModal({ open, setOpen, query, setQuery }: Props) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                ...query,
                range: [
                    query.minCount ? parseInt(query.minCount) : 0,
                    query.maxCount ? parseInt(query.maxCount) : 100,
                ],
            });
        }
    }, [open, query, form]);

    const handleApply = (values: any) => {
        const [min, max] = values.range || [0, 100];

        const newQuery = {
            ...query,
            ...values,
            ...(min !== undefined && min !== 0 && { minCount: min }),
            ...(max !== undefined && max !== 100 && { maxCount: max }),
        };
        delete newQuery.range;
        setQuery(newQuery);
        setOpen(false);
    };

    const handleReset = () => {
        form.resetFields();
        setQuery({
            ...query,
            minCount: null,
            maxCount: null,
            sort: null,
            order: null,
            page: null
        });
        setOpen(false);
    };

    return (
        <Modal
            title="Filter Global Beds"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            centered
            className="rounded-2xl"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleApply}
            >
                {/* Hotel Usage Range Slider */}
                <div className="px-2 mb-8">
                    <Form.Item name="range" label="Hotel Usage Count">
                        <Slider 
                            range 
                            min={0} 
                            max={100} 
                            marks={{
                                0: '0',
                                25: '25',
                                50: '50',
                                75: '75',
                                100: '100+'
                            }}
                            tooltip={{ formatter: (val) => `${val} hotels` }} 
                            trackStyle={[{ backgroundColor: '#10b981' }]}
                            handleStyle={[
                                { borderColor: '#059669' },
                                { borderColor: '#059669' }
                            ]}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="sort" label="Sort By">
                        <Select className="h-10">
                            <Select.Option value="name">Bed Name</Select.Option>
                            <Select.Option value="count">Hotel Usage</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="order" label="Direction">
                        <Select className="h-10">
                            <Select.Option value="asc">Ascending</Select.Option>
                            <Select.Option value="desc">Descending</Select.Option>
                        </Select>
                    </Form.Item>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button 
                        onClick={handleReset} 
                        className="h-10 rounded-xl font-medium"
                    >
                        Reset Defaults
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        className="h-10 rounded-xl bg-emerald-600 font-bold border-none hover:!bg-emerald-500"
                    >
                        Apply Filters
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}