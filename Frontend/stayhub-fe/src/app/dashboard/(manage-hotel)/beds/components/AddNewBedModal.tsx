
import { Modal, Form, Input, Button, message } from "antd";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function AddNewBedModal({ open, onClose, onCreated }: Props) {
    const [form] = Form.useForm();

    const handleCreate = async (values: { name: string }) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/beds/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...values}), // Default count to 0
                credentials: "include"
            });

            if (res.ok) {
                message.success("New bed type created globally!");
                form.resetFields();
                onCreated();
            } else {
                message.error("This bed type already exists!");
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
                    <Button type="primary" htmlType="submit" className="bg-blue-600">
                        Create
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}