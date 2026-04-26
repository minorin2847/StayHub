"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Select, message, Button, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  KeyOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
  StarOutlined,
  StarFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CreateModal = ({ open, onClose, onSuccess, roomTypes }: any) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [coverImageUid, setCoverImageUid] = useState<string | null>(null);

  const previewItems = useMemo(() => {
    return fileList.map((file: any) => {
      let url = file.thumbUrl || file._previewUrl || "";

      if (!url && file.originFileObj) {
        url = URL.createObjectURL(file.originFileObj as Blob);
        file._previewUrl = url;
      }

      return {
        key: file.uid,
        name: file.name,
        url,
      };
    });
  }, [fileList]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setFileList([]);
      setSelectedPreview(null);
      setCoverImageUid(null);
    }
  }, [open, form]);

  useEffect(() => {
    if (!coverImageUid && previewItems.length > 0) {
      setCoverImageUid(previewItems[0].key);
    }
  }, [previewItems, coverImageUid]);

  useEffect(() => {
    if (!selectedPreview && previewItems.length > 0) {
      setSelectedPreview(previewItems[0].url);
    }
  }, [previewItems, selectedPreview]);

  const handleCancel = () => {
    const currentValues = form.getFieldsValue();
    const isFormDirty = Object.keys(currentValues).some(
      (key) => currentValues[key],
    );

    const hasImages = fileList.length > 0;

    if (isFormDirty || hasImages) {
      Modal.confirm({
        title: "Discard changes?",
        content: "You have unsaved data. Are you sure you want to close?",
        okText: "Yes, discard",
        cancelText: "Keep editing",
        onOk: onClose,
      });
    } else {
      onClose();
    }
  };

  const onReset = () => {
    form.resetFields();
    setFileList([]);
    setSelectedPreview(null);
    setCoverImageUid(null);
  };

  const removeImage = (uid: string) => {
    setFileList((prev) => prev.filter((file) => file.uid !== uid));

    const removedPreview = previewItems.find((item) => item.key === uid)?.url;

    if (selectedPreview === removedPreview) {
      setSelectedPreview(null);
    }

    if (coverImageUid === uid) {
      setCoverImageUid(null);
    }
  };

  const handleFinish = async (values: any) => {
    if (!API_URL) {
      message.error("API URL is not configured.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: values.name,
        typeid: values.typeid ? Number(values.typeid) : null,
        note: values.note || "",
      };

      const createRes = await fetch(`${API_URL}/employee/rooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();

        if (createRes.status === 401) {
          throw new Error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        }

        if (createRes.status === 403) {
          throw new Error("Bạn không có quyền tạo phòng.");
        }

        throw new Error(errorText || "Failed to create room");
      }

      const data = await createRes.json();

      const roomId =
        data?.room?.id ||
        data?.data?.room?.id ||
        data?.data?.id ||
        data?.id;

      if (!roomId) {
        throw new Error("Room created but room ID was not returned.");
      }

      if (fileList.length > 0) {
        await Promise.all(
          fileList.map(async (file) => {
            const originFile = file.originFileObj;

            if (!originFile) return;

            const formData = new FormData();
            formData.append("image", originFile);
            formData.append("isCover", String(file.uid === coverImageUid));

            const uploadRes = await fetch(
              `${API_URL}/employee/rooms/${roomId}/images`,
              {
                method: "POST",
                credentials: "include",
                body: formData,
              },
            );

            if (!uploadRes.ok) {
              const errorText = await uploadRes.text();
              throw new Error(errorText || `Upload failed: ${file.name}`);
            }
          }),
        );
      }

      message.success({
        content: "Room created successfully!",
        className: "mt-12",
      });

      await onSuccess();

      form.resetFields();
      setFileList([]);
      setSelectedPreview(null);
      setCoverImageUid(null);

      onClose();
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.message || "An error occurred during room creation.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
      width={1100}
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
      <div className="bg-slate-50 flex flex-col w-full min-h-[600px] overflow-hidden rounded-[24px]">
        <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl shadow-inner">
              <KeyOutlined className="text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1">
                Create New Room
              </h2>
              <p className="text-slate-500 text-sm">
                Register a new room assignment and gallery
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                  <h3 className="font-semibold text-slate-700">
                    Gallery Preview
                  </h3>
                  <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                    {previewItems.length} photos
                  </span>
                </div>

                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center relative shadow-inner group">
                  {selectedPreview ? (
                    <>
                      <img
                        src={selectedPreview}
                        alt="preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />

                      {previewItems.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIndex = previewItems.findIndex(
                                (img) => img.url === selectedPreview,
                              );
                              const newIndex =
                                currentIndex > 0
                                  ? currentIndex - 1
                                  : previewItems.length - 1;
                              setSelectedPreview(previewItems[newIndex].url);
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/70 hover:bg-white backdrop-blur-sm shadow-md text-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                          >
                            <LeftOutlined />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIndex = previewItems.findIndex(
                                (img) => img.url === selectedPreview,
                              );
                              const newIndex =
                                currentIndex < previewItems.length - 1
                                  ? currentIndex + 1
                                  : 0;
                              setSelectedPreview(previewItems[newIndex].url);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/70 hover:bg-white backdrop-blur-sm shadow-md text-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                          >
                            <RightOutlined />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <PictureOutlined className="text-4xl opacity-50" />
                      <span className="text-sm font-medium">
                        No image spotlighted
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-row gap-3 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar items-center">
                  {previewItems.map((img) => {
                    const isSelected = selectedPreview === img.url;
                    const isCover = coverImageUid === img.key;

                    return (
                      <div
                        key={img.key}
                        className={`shrink-0 w-24 h-24 relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                          isSelected
                            ? "border-indigo-500 shadow-md scale-95"
                            : "border-slate-200 hover:border-indigo-300"
                        }`}
                        onClick={() => setSelectedPreview(img.url)}
                      >
                        {img.url && (
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                        )}

                        <button
                          type="button"
                          className="absolute top-1.5 left-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImageUid(img.key);
                          }}
                          title="Set as Cover"
                        >
                          {isCover ? (
                            <StarFilled className="text-yellow-500 text-[11px]" />
                          ) : (
                            <StarOutlined className="text-slate-400 text-[11px]" />
                          )}
                        </button>

                        <button
                          type="button"
                          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors text-slate-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(img.key);
                          }}
                        >
                          <DeleteOutlined className="text-[11px]" />
                        </button>
                      </div>
                    );
                  })}

                  <div className="shrink-0 w-24 h-24 relative">
                    <Upload
                      multiple
                      showUploadList={false}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full block [&>.ant-upload]:w-full [&>.ant-upload]:h-full"
                      beforeUpload={(_, fileListBatch) => {
                        setFileList((prev) => {
                          const updated = [...prev];

                          fileListBatch.forEach((file) => {
                            if (!updated.some((x) => x.uid === file.uid)) {
                              updated.push({
                                uid: file.uid,
                                name: file.name,
                                size: file.size,
                                type: file.type,
                                originFileObj: file,
                                status: "done",
                              } as unknown as UploadFile);
                            }
                          });

                          const newest = updated[updated.length - 1];

                          if (newest && newest.originFileObj) {
                            const newUrl = URL.createObjectURL(
                              newest.originFileObj as Blob,
                            );
                            (newest as any)._previewUrl = newUrl;
                            setSelectedPreview(newUrl);
                          }

                          return updated;
                        });

                        return false;
                      }}
                    >
                      <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all text-slate-400">
                        <PlusOutlined className="text-xl" />
                      </div>
                    </Upload>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
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
                      label={
                        <span className="font-medium text-slate-600">
                          Room Name/Number{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input
                        size="large"
                        className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200"
                        placeholder="e.g. 101 or Presidential Suite"
                      />
                    </Form.Item>

                    <Form.Item
                      name="typeid"
                      label={
                        <span className="font-medium text-slate-600">
                          Room Type <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Select
                        size="large"
                        className="h-10 [&>.ant-select-selector]:rounded-xl [&>.ant-select-selector]:bg-slate-50 [&>.ant-select-selector]:border-slate-200"
                        placeholder="Select a room type"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toString()
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={roomTypes?.map((type: any) => ({
                          label: type.name,
                          value: type.id,
                        }))}
                      />
                    </Form.Item>

                    <div className="col-span-2">
                      <Form.Item
                        name="note"
                        label={
                          <span className="font-medium text-slate-600">
                            Notes
                          </span>
                        }
                      >
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
          </div>
        </div>

        <div className="mt-8 px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between z-10 w-full relative">
          <div className="flex-1">
            {previewItems.length === 0 ? (
              <span className="text-sm text-slate-400 font-medium">
                No images uploaded yet...
              </span>
            ) : (
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                Ready to create
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
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
              Add Room
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateModal;