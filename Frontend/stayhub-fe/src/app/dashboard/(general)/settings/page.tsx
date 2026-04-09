"use client";

import { useDashboardAuth } from "@/context/DashboardAuthContext";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoMdKey } from "react-icons/io";
import { Modal, Input, Form, Tag, message } from "antd";
import { Role } from "@/types/Role";

export default function SettingPage() {
    const { user, isLoading: authLoading, reloadUser } = useDashboardAuth();
    const [messageApi, contextHolder] = message.useMessage();

    // UI States
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
    });
    const [originalData, setOriginalData] = useState({});
    const [branchName, setBranchName] = useState("");
    const [hotelName, setHotelName] = useState("");

    // Modal State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [pwdForm] = Form.useForm();

    // Reusable Custom Loading Component
    const CustomLoader = ({ text = "Loading..." }: { text?: string }) => (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-[32px] border border-slate-100 shadow-sm w-full max-w-md mx-auto">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-medium">{text}</p>
        </div>
    );

    useEffect(() => {
        if (user) {
            const initialData = {
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                email: user.email || "",
                phone: user.phone || "",
            };
            setFormData(initialData);
            setOriginalData(initialData);

            const fetchData = async () => {
                setIsPageLoading(true);
                try {
                    // Added credentials: "include" to GET requests
                    const bRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/branches/get/${user.branchid}`, { credentials: "include" });
                    //const hRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/hotels/get/${user.hotelid}`, { credentials: "include" });
                    const bData = await bRes.json();
                    //const hData = await hRes.json();
                    setBranchName(bData.name || "N/A");
                    //setHotelName(hData.name || "N/A");
                } catch (err) {
                    messageApi.error("Failed to fetch organizational details");
                } finally {
                    setIsPageLoading(false);
                }
            };
            fetchData();
        }
    }, [user, messageApi]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async () => {
        const changedData = Object.keys(formData).reduce((acc: any, key) => {
            if (formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]) {
                acc[key] = formData[key as keyof typeof formData];
            }
            return acc;
        }, {});

        if (Object.keys(changedData).length === 0) {
            return messageApi.info("No changes detected");
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/edit/${user?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Included credentials
                body: JSON.stringify(changedData),
            });
            if (res.ok) {
                await reloadUser();
                setOriginalData(formData);
                messageApi.success("Changes saved successfully");
            } else {
                throw new Error();
            }
        } catch (err) {
            messageApi.error("Error saving changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            // 1. Validate fields (Ant Design handles the 'new !== old' and 'match' logic)
            const values = await pwdForm.validateFields();

            // 2. Call the API
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/changepassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    oldpassword: values.oldPassword,
                    newpassword: values.newPassword
                }),
            });

            if (res.ok) {
                messageApi.success("Password updated successfully!");
                setIsPasswordModalOpen(false);
                pwdForm.resetFields();
            } else if (res.status === 400) {
                // Handle incorrect old password
                messageApi.error("Incorrect old password. Please try again.");
                pwdForm.resetFields(); // Reset all fields on failure as requested
            } else {
                messageApi.error("An error occurred. Please try again later.");
                pwdForm.resetFields();
            }
        } catch (err) {
            // This catch block handles Ant Design validation errors 
            // (the red text under inputs). We don't want to reset fields here 
            // so the user can fix their typos.
            console.log("Validation failed:", err);
        }
    };

    if (authLoading || isPageLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <CustomLoader text="Loading your profile..." />
            </div>
        );
    }

    if (!user) redirect("/dashboard/login");

    return (
        <div className="flex flex-col m-8 gap-y-3 w-auto h-screen relative">
            {contextHolder}

            {/* Password Modal */}
            <Modal
                title="Change Password"
                open={isPasswordModalOpen}
                onOk={handlePasswordSubmit}
                onCancel={() => {
                    setIsPasswordModalOpen(false);
                    pwdForm.resetFields();
                }}
                okText="Submit"
                okButtonProps={{ className: "bg-green-600 hover:bg-green-700" }}
            >
                <Form form={pwdForm} layout="vertical" className="mt-4">
                    {/* Old Password */}
                    <Form.Item
                        name="oldPassword"
                        label="Old Password"
                        rules={[{ required: true, message: 'Please input your old password!' }]}
                    >
                        {/* type="password" on a standard Input removes the Ant Design visibility toggle */}
                        <Input type="password" placeholder="Enter old password" />
                    </Form.Item>

                    {/* New Password */}
                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        dependencies={['oldPassword']}
                        rules={[
                            { required: true, message: 'Please input your new password!' },
                            { min: 6, message: 'Password must be at least 6 characters' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('oldPassword') !== value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('New password cannot be the same as the old password!'));
                                },
                            }),
                        ]}
                    >
                        <Input type="password" placeholder="Enter new password" />
                    </Form.Item>

                    {/* Repeat New Password - With Match Check */}
                    <Form.Item
                        name="repeatPassword"
                        label="Repeat New Password"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Please repeat your new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    // Check if the value matches the 'newPassword' field
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input type="password" placeholder="Repeat new password" />
                    </Form.Item>
                </Form>
            </Modal>

            <div className="flex w-full h-fit">
                <p className="text-[30px] font-bold font-sans">User settings</p>
            </div>

            <div className="relative flex flex-row h-full w-full gap-x-8">
                {/* Saving Overlay using your custom design */}
                {isSaving && (
                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                        <CustomLoader text="Saving changes..." />
                    </div>
                )}

                {/* Left Column: Avatar */}
                <div className="flex grow min-w-1/4 flex-col h-full gap-y-8 items-center">
                    <Image
                        className="w-3/4 mt-6 aspect-square border-2 border-emerald-600 rounded-full"
                        unoptimized
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstname}+${user?.lastname}&rounded=true&background=ecfdf5&color=096`}
                        alt="Avatar"
                        width={128}
                        height={128}
                    />
                    <div className="flex flex-row gap-x-3 w-3/4 h-[40px]">
                        <button className="transition ease-in-out flex flex-row grow items-center justify-evenly bg-gray-300/50 border-2 rounded-md hover:bg-blue-500 hover:text-white cursor-pointer">
                            <FaEdit size={20} />
                            <p className="text-[20px]">Edit</p>
                        </button>
                        <button className="transition ease-in-out flex flex-row grow items-center justify-evenly bg-gray-300/50 border-2 rounded-md hover:bg-red-500 hover:text-white cursor-pointer">
                            <FaTrash size={18} />
                            <p className="text-[20px]">Delete</p>
                        </button>
                    </div>
                </div>

                {/* Right Column: Information */}
                <div className="flex flex-col gap-y-8 px-6 grow-4">
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="transition ease-in-out flex flex-row gap-x-2 w-fit h-fit p-2 rounded-md mt-6 ml-auto border-2 text-white bg-green-600 hover:bg-green-700 cursor-pointer"
                    >
                        <IoMdKey size={23} />
                        <p className="font-bold text-[15px]">Change password</p>
                    </button>

                    <div className="flex flex-col w-full grow px-6 py-3 bg-gray-100/50 rounded-xl border border-gray-200">
                        <p className="text-[20px] mb-4">Personal information</p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-y-2">
                                <p className="text-[18px] font-bold">First name</p>
                                <Input name="firstname" value={formData.firstname} onChange={handleInputChange} className="h-10" />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <p className="text-[18px] font-bold">Last name</p>
                                <Input name="lastname" value={formData.lastname} onChange={handleInputChange} className="h-10" />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <p className="text-[18px] font-bold">Email</p>
                                <Input name="email" value={formData.email} onChange={handleInputChange} className="h-10" />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <p className="text-[18px] font-bold">Phone</p>
                                <Input name="phone" value={formData.phone} onChange={handleInputChange} className="h-10" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-full grow px-6 py-3 bg-gray-100/50 rounded-xl border border-gray-200">
                        <p className="text-[20px] mb-4">Employee details</p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-y-2">
                                <p className="text-[18px] font-bold">Username</p>
                                <Input disabled value={user?.username || ""} className="h-10 bg-gray-200" />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <p className="text-[18px] font-bold">Roles</p>
                                <div className="flex flex-wrap gap-1 items-center min-h-[40px]">
                                    {user?.roles?.map(({ name, tier }: Role) => (
                                        <Tag color={
                                            tier == 1 ? "red" :
                                                tier == 2 ? "blue" :
                                                    tier == 3 ? "gold" :
                                                        "purple"
                                        } key={name}>{name}</Tag>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <p className="text-[18px] font-bold">Assigned Branch</p>
                                <Input disabled value={branchName} className="h-10 bg-gray-200" />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <p className="text-[18px] font-bold">Assigned Hotel</p>
                                <Input disabled value={hotelName} className="h-10 bg-gray-200" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex flex-row gap-x-6 w-fit h-fit text-[15px]">
                        <button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="transition duration-200 flex justify-center items-center px-6 py-2 hover:bg-blue-500 rounded-md hover:text-white border-2 hover:border-white cursor-pointer ease-in-out font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            Save changes
                        </button>
                        <button
                            onClick={() => {
                                setFormData(originalData);
                                messageApi.info("Changes reverted");
                            }}
                            disabled={isSaving}
                            className="transition duration-200 flex justify-center items-center px-6 py-2 hover:bg-red-500 rounded-md hover:text-white border-2 hover:border-white cursor-pointer ease-in-out font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            Revert
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}