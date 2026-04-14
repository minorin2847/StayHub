import { Modal, Form, Input, Button, message } from "antd";
import { useEffect } from "react";
import { GlobalBedData } from "../AdminBedView"; // Adjust import path if needed

interface Props {
    open: boolean;
    current: GlobalBedData | null;
    onClose: () => void;
    onSuccess: () => Promise<void>;
}

export default function EditModal({ open, current, onClose, onSuccess }: Props) {
    const [form] = Form.useForm();

    // Prefill the form when the modal opens with a selected record
    useEffect(() => {
        if (open && current) {
            form.setFieldsValue({ name: current.bed_name });
        } else {
            form.resetFields();
        }
    }, [open, current, form]);

    const handleEdit = async (values: { name: string }) => {
        if (!current) return;

        // --- NEW LOGIC: Check if the value actually changed ---
        if (values.name.trim() === current.bed_name) {
            message.info("No changes detected.");
            onClose();
            return; // Exit early, skipping the API call
        }

        try {
            // Adjust endpoint to match your global editBed controller route (/:name)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/beds/edit/${current.bed_name}`, {
                method: "PATCH", // or PATCH depending on your backend setup
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
                credentials: "include"
            });

            if (res.ok) {
                message.success("Bed type updated successfully!");
                await onSuccess();
                onClose();
            } else if (res.status === 409) {
                message.error(`Bed with name "${values.name}" already exists!`);
            } else {
                message.error("Failed to update bed type.");
            }
        } catch (e) {
            message.error("Server error editing bed.");
        }
    };

    return (
        <Modal
            title="Edit Bed Type"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleEdit}>
                <Form.Item 
                    name="name" 
                    label="Bed Name" 
                    rules={[{ required: true, message: 'Please enter a name' }]}
                >
                    <Input placeholder="e.g. Super King XL" className="h-10 rounded-lg" />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit" className="bg-emerald-600 hover:!bg-emerald-500">
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}