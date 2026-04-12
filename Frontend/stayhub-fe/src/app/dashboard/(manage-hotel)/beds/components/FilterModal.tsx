import { Modal, Form, Select, Button, Slider } from "antd";
import { Dispatch, SetStateAction, useEffect } from "react";
import { HotelBedFilterData } from "../ManageHotelBedView";

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    query: HotelBedFilterData;
    setQuery: Dispatch<SetStateAction<HotelBedFilterData>>;
}

export default function FilterModal({ open, setOpen, query, setQuery }: Props) {
    const [form] = Form.useForm();

    // Sync form values with current query when modal opens
    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                // Convert optional string counts back to numbers for the slider
                ...query,
                range: [
                    query.minCount ? parseInt(query.minCount) : 0,
                    query.maxCount ? parseInt(query.maxCount) : 100,
                ],
            });
        }
    }, [open, query, form]);

    const handleApply = (values: any) => {
        // Destructure the range array into individual variables
        const [min, max] = values.range || [0, 100];

        const newQuery = {
            ...query,
            ...values,
        // Insert salaryMin ONLY if it has a value and is not 0
        ...(min !== undefined && min !== 0 && { minCount: min }),
        
        // Insert salaryMax ONLY if it has a value and is not 100000
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
            title="Filter Hotel Beds"
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
                {/* Quantity Range Slider */}
                <div className="px-2 mb-8">
                    <Form.Item name="range" label="Quantity Range">
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
                            tooltip={{ formatter: (val) => `${val} units` }} 
                            // Emerald styling
                            trackStyle={[{ backgroundColor: '#10b981' }]}
                            handleStyle={[
                                { borderColor: '#059669' },
                                { borderColor: '#059669' }
                            ]}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Sorting */}
                    <Form.Item name="sort" label="Sort By">
                        <Select className="h-10">
                            <Select.Option value="name">Bed Name</Select.Option>
                            <Select.Option value="count">Total Quantity</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="order" label="Direction">
                        <Select className="h-10">
                            <Select.Option value="ASC">Ascending</Select.Option>
                            <Select.Option value="DESC">Descending</Select.Option>
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
                        className="h-10 rounded-xl bg-emerald-600 font-bold border-none"
                    >
                        Apply Filters
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}