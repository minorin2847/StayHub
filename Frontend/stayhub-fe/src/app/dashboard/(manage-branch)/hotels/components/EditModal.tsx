"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  message,
  Skeleton,
  Upload,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PictureOutlined,
  StarOutlined,
  StarFilled,
  BankOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Hotel } from "@/types/Hotel";

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  current: Hotel | null;
}

interface HotelImage {
  id: number;
  hotelid: number;
  image_url: string;
  signed_url?: string | null;
  is_cover?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const EditModal = ({ open, onClose, onSuccess, current }: EditModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  const [existingImages, setExistingImages] = useState<HotelImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<UploadFile[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [coverImageKey, setCoverImageKey] = useState<string | null>(null);

  const hotelId = current?.id ?? null;

  const previewItems = useMemo(() => {
    const oldImages = existingImages.map((img) => ({
      key: `existing-${img.id}`,
      id: img.id,
      name: img.image_url.split("/").pop() || `image-${img.id}`,
      url: img.signed_url || img.image_url || "",
      isExisting: true,
    }));

    const freshImages = newFiles.map((file: any) => {
      let url = file.thumbUrl || file._previewUrl || "";
      if (!url && file.originFileObj) {
        url = URL.createObjectURL(file.originFileObj as Blob);
        file._previewUrl = url;
      }
      return {
        key: file.uid,
        id: null,
        name: file.name,
        url,
        isExisting: false,
      };
    });

    return [...oldImages, ...freshImages];
  }, [existingImages, newFiles]);

  useEffect(() => {
    const loadData = async () => {
      if (!open || !current) {
        form.resetFields();
        setInitialData(null);
        setExistingImages([]);
        setDeletedImageIds([]);
        setNewFiles([]);
        setSelectedPreview(null);
        setCoverImageKey(null);
        return;
      }

      if (!API_URL) {
        message.error("API URL is missing");
        return;
      }

      try {
        setLoading(true);

        const formattedData = {
          name: current.name,
          branchid: current.branchid?.toString(),
          location: current.location,
          contact_email: current.contact_email,
          contact_phone: current.contact_phone,
          classification: current.classification,
          description: current.description,
        };

        setInitialData(formattedData);
        form.setFieldsValue(formattedData);

        const imgRes = await fetch(`${API_URL}/employee/hotels/${current.id}/images`, {
          method: "GET",
          credentials: "include",
        });

        if (!imgRes.ok) {
          const errorText = await imgRes.text();
          throw new Error(errorText || "Failed to load hotel images");
        }

        const images = await imgRes.json();
        const safeImages = Array.isArray(images) ? images : [];

        setExistingImages(safeImages);
        setDeletedImageIds([]);
        setNewFiles([]);
        setSelectedPreview(safeImages[0]?.signed_url || null);

        const coverImg = safeImages.find((img: any) => img.is_cover);
        if (coverImg) {
          setCoverImageKey(`existing-${coverImg.id}`);
        } else if (safeImages.length > 0) {
          setCoverImageKey(`existing-${safeImages[0].id}`);
        } else {
          setCoverImageKey(null);
        }
      } catch (error: any) {
        console.error(error);
        message.error(error?.message || "Failed to load hotel data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, current, form]);

  useEffect(() => {
    if (!selectedPreview && previewItems.length > 0) {
      setSelectedPreview(previewItems[0].url);
    }
  }, [previewItems, selectedPreview]);

  useEffect(() => {
    if (!coverImageKey && previewItems.length > 0) {
      setCoverImageKey(previewItems[0].key);
    }
  }, [previewItems, coverImageKey]);

  const handleCancel = () => {
    const currentValues = form.getFieldsValue();
    const isFormDirty = Object.keys(currentValues).some(
      (key) =>
        JSON.stringify(currentValues[key]) !== JSON.stringify(initialData?.[key])
    );

    const hasImageChanges = deletedImageIds.length > 0 || newFiles.length > 0;

    if (isFormDirty || hasImageChanges) {
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

  const updateHotel = async (values: any) => {
    if (!API_URL) throw new Error("API URL is missing");
    if (!hotelId) throw new Error("Hotel ID is missing");

    const payload = {
      name: values.name,
      branchid: values.branchid ? parseInt(values.branchid, 10) : null,
      location: values.location,
      contact_email: values.contact_email || null,
      contact_phone: values.contact_phone || null,
      classification: values.classification || 0,
      description: values.description || "",
    };

    const res = await fetch(`${API_URL}/employee/hotels/${hotelId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Update hotel failed");
    }

    return res.json();
  };

  const uploadNewImages = async () => {
    if (!API_URL || !hotelId || newFiles.length === 0) return;

    await Promise.all(
      newFiles.map(async (file) => {
        const originFile = file.originFileObj;
        if (!originFile) return;

        const formData = new FormData();
        formData.append("image", originFile);
        formData.append("isCover", String(file.uid === coverImageKey));

        const res = await fetch(`${API_URL}/employee/hotels/${hotelId}/images`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Upload failed: ${file.name}`);
        }
      })
    );
  };

  const deleteRemovedImages = async () => {
    if (!API_URL || !hotelId || deletedImageIds.length === 0) return;

    await Promise.all(
      deletedImageIds.map(async (imageId) => {
        const res = await fetch(
          `${API_URL}/employee/hotels/${hotelId}/images/${imageId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Delete failed: image ${imageId}`);
        }
      })
    );
  };

  const handleFinish = async (values: any) => {
    try {
      setSaving(true);
      await updateHotel(values);
      await uploadNewImages();
      await deleteRemovedImages();

      if (coverImageKey?.startsWith("existing-")) {
        const id = coverImageKey.split("-")[1];
        await fetch(`${API_URL}/employee/hotels/${hotelId}/images/${id}/cover`, {
          method: "PUT",
          credentials: "include",
        });
      }

      message.success({
        content: "Hotel updated successfully!",
        className: "mt-12",
      });
      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setDeletedImageIds((prev) =>
      prev.includes(imageId) ? prev : [...prev, imageId]
    );
    if (coverImageKey === `existing-${imageId}`) {
      setCoverImageKey(null);
    }
  };

  const removeNewImage = (uid: string) => {
    setNewFiles((prev) => prev.filter((f) => f.uid !== uid));
    if (coverImageKey === uid) {
      setCoverImageKey(null);
    }
  };

  const resetToOriginal = async () => {
    form.setFieldsValue(initialData);
    setDeletedImageIds([]);
    setNewFiles([]);

    if (!API_URL || !hotelId) return;

    try {
      setLoading(true);

      const imgRes = await fetch(`${API_URL}/employee/hotels/${hotelId}/images`, {
        method: "GET",
        credentials: "include",
      });

      if (!imgRes.ok) {
        const errorText = await imgRes.text();
        throw new Error(errorText || "Failed to reload hotel images");
      }

      const images = await imgRes.json();
      const safeImages = Array.isArray(images) ? images : [];

      setExistingImages(safeImages);
      setSelectedPreview(safeImages[0]?.signed_url || null);
      
      const coverImg = safeImages.find((img: any) => img.is_cover);
      if (coverImg) {
        setCoverImageKey(`existing-${coverImg.id}`);
      } else if (safeImages.length > 0) {
        setCoverImageKey(`existing-${safeImages[0].id}`);
      } else {
        setCoverImageKey(null);
      }
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "Failed to reset data");
    } finally {
      setLoading(false);
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
        {/* Header Ribbon */}
        <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl shadow-inner">
              <BankOutlined className="text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1">
                Edit Hotel
              </h2>
              <p className="text-slate-500 text-sm">
                Update essential details and manage your gallery
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 pb-0">
          {loading ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Gallery Preview */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 flex flex-col gap-4 h-full">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                    <h3 className="font-semibold text-slate-700">Gallery Preview</h3>
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
                                const currentIndex = previewItems.findIndex(img => img.url === selectedPreview);
                                const newIndex = currentIndex > 0 ? currentIndex - 1 : previewItems.length - 1;
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
                                const currentIndex = previewItems.findIndex(img => img.url === selectedPreview);
                                const newIndex = currentIndex < previewItems.length - 1 ? currentIndex + 1 : 0;
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
                        <span className="text-sm font-medium">No image spotlighted</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row gap-3 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar items-center">
                    {previewItems.map((img) => {
                      const isSelected = selectedPreview === img.url;
                      const isCover = coverImageKey === img.key;

                      return (
                        <div
                          key={img.key}
                          className={`shrink-0 w-24 h-24 relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                            isSelected ? "border-blue-500 shadow-md scale-95" : "border-slate-200 hover:border-blue-300"
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

                          {/* Cover Tag Button */}
                          <button
                            type="button"
                            className="absolute top-1.5 left-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverImageKey(img.key);
                            }}
                            title="Set as Cover"
                          >
                            {isCover ? (
                              <StarFilled className="text-yellow-500 text-[11px]" />
                            ) : (
                              <StarOutlined className="text-slate-400 text-[11px]" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors text-slate-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (img.isExisting && img.id) {
                                removeExistingImage(img.id);
                              } else {
                                removeNewImage(img.key);
                              }
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
                          setNewFiles((prev) => {
                            const updated = [...prev];
                            fileListBatch.forEach((f) => {
                              if (!updated.some((x) => x.uid === f.uid)) {
                                updated.push({
                                  uid: f.uid,
                                  name: f.name,
                                  size: f.size,
                                  type: f.type,
                                  originFileObj: f,
                                  status: "done",
                                } as unknown as UploadFile);
                              }
                            });
                            
                            // Select newest image automatically
                            const newest = updated[updated.length - 1];
                            if (newest && newest.originFileObj) {
                               const newUrl = URL.createObjectURL(newest.originFileObj as Blob);
                               (newest as any)._previewUrl = newUrl;
                               setSelectedPreview(newUrl);
                            }
                            
                            return updated;
                          });
                          return false;
                        }}
                      >
                        <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all text-slate-400">
                          <PlusOutlined className="text-xl" />
                        </div>
                      </Upload>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Form Information */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 h-full">
                  <Form 
                    layout="vertical" 
                    form={form} 
                    onFinish={handleFinish}
                    requiredMark="optional"
                  >
                    <Form.Item name="branchid" hidden>
                      <Input />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-1">
                      <Form.Item
                        name="name"
                        label={<span className="font-medium text-slate-600">Hotel Name <span className="text-red-500">*</span></span>}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input size="large" className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200" placeholder="E.g. Azure Resort & Spa" />
                      </Form.Item>

                      <Form.Item
                        name="location"
                        label={<span className="font-medium text-slate-600">Location <span className="text-red-500">*</span></span>}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input size="large" className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200" placeholder="E.g. Miami, FL" />
                      </Form.Item>

                      <Form.Item 
                        name="contact_email" 
                        label={<span className="font-medium text-slate-600">Contact Email</span>}
                      >
                        <Input size="large" className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200" placeholder="contact@address.com" />
                      </Form.Item>

                      <Form.Item 
                        name="contact_phone" 
                        label={<span className="font-medium text-slate-600">Contact Phone</span>}
                      >
                        <Input size="large" className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200" placeholder="+1 (305) 555-0123" />
                      </Form.Item>

                      <div className="col-span-2">
                        <Form.Item 
                          name="description" 
                          label={<span className="font-medium text-slate-600">Description</span>}
                        >
                          <Input.TextArea
                            rows={4}
                            className="rounded-xl bg-slate-50 hover:bg-white focus:bg-white border-slate-200 custom-scrollbar"
                            placeholder="Write a short description for this hotel..."
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </Form>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between z-10 w-full relative">
          <div className="flex-1">
            {previewItems.length === 0 ? (
              <span className="text-sm text-slate-400 font-medium">No images uploaded yet...</span>
            ) : (
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  Ready to update
                </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={resetToOriginal}
              disabled={loading || saving}
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
              loading={saving}
              onClick={form.submit}
              size="large"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-lg font-semibold px-6 border-0 h-10 flex items-center"
            >
              Update Hotel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditModal;