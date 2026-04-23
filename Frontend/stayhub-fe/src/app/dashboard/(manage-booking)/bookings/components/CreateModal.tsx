"use client";
import React, { useMemo, useRef, useState } from "react";
import { Modal, Form, Input, Row, Col, message, AutoComplete, Divider, InputNumber, DatePicker, Select, Button, Space } from "antd";
import { DeleteOutlined, PlusOutlined, HomeOutlined } from "@ant-design/icons";
import { Room, RoomType } from "@/types/Room";
import dayjs from "dayjs";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
    rooms: Room[];
    roomTypes: RoomType[];
}

const CreateModal = ({ open, onClose, onSuccess, rooms, roomTypes }: Props) => {
    const [form] = Form.useForm();
    
    const [guestOptions, setGuestOptions] = useState<{ label: string; value: string; data: any }[]>([]);
    const [selectedGuest, setSelectedGuest] = useState<any>(null);
    const [roomOptions, setRoomOptions] = useState<{ label: string; value: string; id: number }[]>([]);
    
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestSearchValue, setGuestSearchValue] = useState("");

    const abortControllerRef = useRef<AbortController | null>(null);

    // --- GUEST LOGIC ---
    const fetchGuests = async (value: string, signal: AbortSignal) => {
        if (value.length < 2) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/guests?name=${value}`,
                { signal, credentials: 'include' }
            );
            const data = await res.json();
            const options = data.response.map((g: any) => ({
                label: `${g.full_name} (${g.phone})`,
                value: g.id.toString(),
                data: g
            }));
            setGuestOptions(options);
        } catch (e: any) {
            if (e.name === 'AbortError') return;
            console.error(e);
        }
    };

    const handleSearch = useMemo(() => {
        const delay = 200;
        let timeoutId: ReturnType<typeof setTimeout>;
        return (value: string) => {
            setGuestSearchValue(value);
            if (abortControllerRef.current) abortControllerRef.current.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fetchGuests(value, controller.signal), delay);
        };
    }, []);

    const onSelectGuest = (value: string, option: any) => {
        const guest = option.data;
        setSelectedGuest(guest);
        setGuestSearchValue(guest.first_name + " " + guest.last_name);
        form.setFieldsValue({ ...guest });
        setShowGuestForm(true);
    };

    const handleGuestKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !selectedGuest && guestSearchValue.trim()) {
            const words = guestSearchValue.trim().split(/\s+/);
            const first_name = words[0] || "";
            const last_name = words.slice(1).join(" ") || "";
            form.setFieldsValue({ first_name, last_name });
            setShowGuestForm(true);
        }
    };

    const handleClearGuest = () => {
        setSelectedGuest(null);
        setShowGuestForm(false);
        setGuestSearchValue("");
        form.resetFields(['first_name', 'last_name', 'phone', 'email', 'id_card_number', 'address']);
    };

    // --- ROOM & DATE LOGIC (Updated for Multi-Room) ---
    const handleRoomSearch = (searchText: string) => {
        if (!searchText) {
            setRoomOptions([]);
            return;
        }
        const filtered = rooms
            .filter((room: Room) => room.name.toLowerCase().includes(searchText.toLowerCase()))
            .map((room: Room) => ({
                label: room.name,
                value: room.name,
                id: room.id
            }));
        setRoomOptions(filtered);
    };

    const onSelectRoom = (value: string, option: any, index: number) => {
        const roomId = option.id;
        // Use Ant Design's setFieldValue to target the specific room in the array
        form.setFieldValue(['rooms', index, 'roomID'], roomId);
        
        const selectedRoomData = rooms.find(r => r.id === roomId);
        if (selectedRoomData) {
            const typeID = (selectedRoomData as any).typeid;
            const matchingType = roomTypes.find(t => t.id === typeID);
            if (matchingType) {
                form.setFieldValue(['rooms', index, 'roomPrice'], matchingType.base_price);
                message.info(`Price auto-filled for ${matchingType.name}`);
            }
        }
    };

    const handleFinish = async (values: any) => {
        try {
            // 1. Ensure Guest Exists
            let guestID = selectedGuest?.id;
            if (!guestID) {
                const guestRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/guests/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        first_name: values.first_name,
                        last_name: values.last_name,
                        phone: values.phone,
                        email: values.email,
                        id_card_number: values.id_card_number,
                        address: values.address
                    }),
                    credentials: "include"
                });
                if (!guestRes.ok) throw new Error("Failed to create new guest profile");
                const newGuest = await guestRes.json();
                guestID = newGuest.id;
            }

            // 2. Format the Rooms Array
            const formattedRooms = values.rooms.map((r: any) => ({
                roomID: r.roomID,
                checkin_date: r.checkin_date.format("YYYY-MM-DD"),
                checkout_date: r.checkout_date.format("YYYY-MM-DD"),
                room_status: r.room_status,
                roomPrice: r.roomPrice
            }));

            // 3. Send the Multiple Room Booking Payload
            const bookingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestID,
                    reserveID: values.reserveID || null, // Optional, if you add an online booking link
                    rooms: formattedRooms
                }),
                credentials: "include"
            });

            if (!bookingRes.ok) throw new Error(await bookingRes.text());

            message.success("Booking created successfully!");
            onSuccess();
            handleClose();
        } catch (error: any) {
            message.error(error.message);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedGuest(null);
        setShowGuestForm(false);
        setGuestSearchValue("");
        setRoomOptions([]);
        onClose();
    };

    return (
        <Modal 
            title="Create New Booking" 
            open={open} 
            onCancel={handleClose} 
            onOk={form.submit} 
            width={750}
            style={{ top: 20 }} // Give it a bit more vertical breathing room
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFinish}
                initialValues={{
                    // Start with one empty room by default
                    rooms: [{
                        checkin_date: dayjs(),
                        checkout_date: dayjs().add(5, 'day'),
                        room_status: 'Reserved'
                    }]
                }}
            >
                <Divider orientation="left">1. Guest Details</Divider>
                <Form.Item label="Search Guest (Name or Phone) - Press Enter for New Guest">
                    <AutoComplete
                        showSearch={{ onSearch: handleSearch }}
                        onSelect={onSelectGuest}
                        onClear={handleClearGuest}
                        onInputKeyDown={handleGuestKeyDown}
                        options={guestOptions}
                        placeholder="Type name..."
                        allowClear
                        value={guestSearchValue}
                        onChange={(val) => setGuestSearchValue(val)}
                    />
                </Form.Item>

                {showGuestForm && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-6 animate-in fade-in duration-300">
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="first_name" label="First Name" rules={[{required: true}]}><Input disabled={!!selectedGuest} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="last_name" label="Last Name" rules={[{required: true}]}><Input disabled={!!selectedGuest} /></Form.Item></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="phone" label="Phone" rules={[{required: true}]}><Input disabled={!!selectedGuest} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="email" label="Email"><Input disabled={!!selectedGuest} /></Form.Item></Col>
                        </Row>
                        <Col span={12}><Form.Item name="id_card_number" label="ID Card Number"><Input disabled={!!selectedGuest} /></Form.Item></Col>
                    </div>
                )}

                <Divider orientation="left">2. Stay & Room Details</Divider>
                
                <Form.List name="rooms">
                    {(fields, { add, remove }) => (
                        <div className="flex flex-col gap-4">
                            {fields.map(({ key, name, ...restField }, index) => (
                                <div key={key} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 relative">
                                    {/* Only show delete button if there is more than 1 room */}
                                    {fields.length > 1 && (
                                        <Button 
                                            type="text" 
                                            danger 
                                            icon={<DeleteOutlined />} 
                                            onClick={() => remove(name)}
                                            className="absolute top-2 right-2"
                                        />
                                    )}
                                    
                                    <h5 className="font-bold text-blue-800 mb-4"><HomeOutlined /> Room {index + 1}</h5>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                {...restField}
                                                name={[name, 'checkin_date']} 
                                                label="Check-in Date" 
                                                rules={[{required: true}]}
                                            >
                                                <DatePicker className="w-full" format="YYYY-MM-DD" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                {...restField}
                                                name={[name, 'checkout_date']} 
                                                label="Check-out Date" 
                                                rules={[{required: true}]}
                                                dependencies={[['rooms', name, 'checkin_date']]}
                                            >
                                                <DatePicker 
                                                    className="w-full" 
                                                    format="YYYY-MM-DD" 
                                                    disabledDate={(current) => {
                                                        const checkin = form.getFieldValue(['rooms', name, 'checkin_date']);
                                                        return current && current <= (checkin || dayjs().startOf('day'));
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                {...restField}
                                                label="Select Room" 
                                                name={[name, 'room_display_name']} 
                                                rules={[{required: true, message: 'Please select a room'}]}
                                            >
                                                <AutoComplete
                                                    options={roomOptions}
                                                    showSearch={{onSearch:handleRoomSearch}}
                                                    onSelect={(val, option) => onSelectRoom(val, option, name)}
                                                    placeholder="Search room by name..."
                                                />
                                            </Form.Item>
                                            {/* Hidden field for actual Room ID */}
                                            <Form.Item {...restField} name={[name, 'roomID']} hidden><Input /></Form.Item>
                                        </Col>
                                        
                                        <Col span={12}>
                                            <Form.Item {...restField} name={[name, 'room_status']} label="Initial Status" rules={[{required: true}]}>
                                                <Select>
                                                    <Select.Option value="Reserved">Reserved</Select.Option>
                                                    <Select.Option value="Checked-In">Checked-In</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item {...restField} name={[name, 'roomPrice']} label="Nightly Rate / Price ($)" rules={[{required: true}]}>
                                                <InputNumber className="w-full" precision={2} min={0} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            
                            <Button 
                                type="dashed" 
                                onClick={() => add({
                                    checkin_date: dayjs(),
                                    checkout_date: dayjs().add(5, 'day'),
                                    room_status: 'Reserved'
                                })} 
                                block 
                                icon={<PlusOutlined />}
                                className="h-12 border-blue-200 text-blue-600 hover:text-blue-500 hover:border-blue-400 bg-blue-50/30"
                            >
                                Add Another Room
                            </Button>
                        </div>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};

export default CreateModal;