"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message, Button } from "antd";
import { ToolOutlined, ReloadOutlined } from "@ant-design/icons";

const EditModal = ({ open, onClose, onSuccess, current, roomTypes }: any) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && current) form.setFieldsValue(current);
        else form.resetFields();
    }, [open, current, form]);

    const handleFinish = async (values: any) => {
        const changedData: any = {};
        Object.keys(values).forEach(key => {
            if (values[key] !== current[key]) changedData[key] = values[key];
        });

        if (Object.keys(changedData).length === 0) return onClose();

        try {
            setSubmitting(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/edit/${current.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(changedData),
            });

            if (res.ok) {
                message.success({
                    content: "Room updated successfully!",
                    className: "mt-12",
                });
                onSuccess();
                onClose();
            } else {
                throw new Error(await res.text());
            }
        } catch (error: any) {
            message.error(`Failed to update room: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        const currentValues = form.getFieldsValue();
        const isFormDirty = Object.keys(currentValues).some((key) => currentValues[key] !== current?.[key]);

        if (isFormDirty) {
            Modal.confirm({
                title: "Discard changes?",
                content: "You have unsaved changes. Are you sure you want to close?",
                okText: "Yes, discard",
                cancelText: "Keep editing",
                onOk: onClose,
            });
        } else {
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            destroyOnHidden
            width={700}
            title={null}
            closeIcon={false}
            styles={{
                body: {
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "24px",
                },
                content: {
                    padding: 0,
                    borderRadius: "24px",
                    background: "transparent",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                },
            }}
        >
            <div className="bg-slate-50 flex flex-col w-full overflow-hidden rounded-[24px]">
                {/* Header Ribbon */}
                <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl shadow-inner">
                            <ToolOutlined className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1">
                                Edit Room Details
                            </h2>
                            <p className="text-slate-500 text-sm">
                                Modify room attributes and configurations
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 pb-0">
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 h-full">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFinish}
                            requiredMark="optional"
                        >
                            <div className="grid grid-cols-2 gap-x-5 gap-y-1">
                                <Form.Item
                                    name="name"
                                    label={<span className="font-medium text-slate-600">Room Name/Number <span className="text-red-500">*</span></span>}
                                    rules={[{ required: true, message: "Required" }]}
                                >
                                    <Input size="large" className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200" placeholder="e.g. 101 or Presidential Suite" />
                                </Form.Item>

                                <Form.Item
                                    name="typeid"
                                    label={<span className="font-medium text-slate-600">Room Type <span className="text-red-500">*</span></span>}
                                    rules={[{ required: true, message: "Required" }]}
                                >
                                    <Select
                                        size="large"
                                        className="h-10 [&>.ant-select-selector]:rounded-xl [&>.ant-select-selector]:bg-slate-50 [&>.ant-select-selector]:border-slate-200"
                                        placeholder="Select a room type"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={roomTypes?.map((t: any) => ({
                                            label: t.name,
                                            value: t.id,
                                        }))}
                                    />
                                </Form.Item>

                                <div className="col-span-2">
                                    <Form.Item name="note" label={<span className="font-medium text-slate-600">Notes</span>}>
                                        <Input.TextArea
                                            rows={4}
                                            className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200 custom-scrollbar"
                                            placeholder="Add any specific details, maintenance notes, or features..."
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-end z-10 w-full relative gap-3">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => form.setFieldsValue(current)}
                        disabled={submitting}
                        size="large"
                        className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 font-medium"
                    >
                        Reset
                    </Button>

                    <Button
                        onClick={handleCancel}
                        size="large"
                        className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        loading={submitting}
                        onClick={form.submit}
                        size="large"
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-md hover:shadow-lg font-semibold px-6 border-0 h-10 flex items-center"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditModal;