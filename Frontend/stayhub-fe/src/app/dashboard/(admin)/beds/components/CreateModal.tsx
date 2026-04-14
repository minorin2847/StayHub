import { Modal, Form, Input, Button, message } from "antd";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
}

export default function CreateModal({ open, onClose, onSuccess }: Props) {
    const [form] = Form.useForm();

    const handleCreate = async (values: { name: string }) => {
        try {
            // Adjust endpoint to match your global addBeds controller route
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/beds/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
                credentials: "include"
            });

            if (res.ok) {
                message.success("New global bed type created!");
                form.resetFields();
                await onSuccess();
                onClose();
            } else if (res.status === 409) {
                message.error("This bed type already exists!");
            } else {
                message.error("Failed to create bed type.");
            }
        } catch (e) {
            message.error("Server error creating bed.");
        }
    };

    return (
        <Modal
            title="Create Brand New Bed Type"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleCreate}>
                <Form.Item 
                    name="name" 
                    label="Bed Name" 
                    rules={[{ required: true, message: 'Please enter a name' }]}
                >
                    <Input placeholder="e.g. Super King XL" className="h-10 rounded-lg" />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => form.resetFields()}>Reset</Button>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit" className="bg-emerald-600 hover:!bg-emerald-500">
                        Create
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}