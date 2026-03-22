import React from "react";
import { Modal, Button } from "antd";
import { BsCheck2Circle } from "react-icons/bs";

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
}

export function SuccessModal({ isOpen, onClose, title }: SuccessModalProps) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      centered
      width={400}
      bodyStyle={{ padding: "30px 20px" }}
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="flex flex-col items-center justify-center text-center bg-white">
        <div className="flex items-center justify-center mb-6">
          <BsCheck2Circle className="text-[#52C41A] text-[72px]" />
        </div>
        <h2 className="text-[16px] text-[#3A3A3A] font-medium mb-8">
          {title}
        </h2>
        <Button
          type="primary"
          size="large"
          style={{ backgroundColor: "#155DFC", borderColor: "#155DFC" }}
          className="w-32"
          onClick={onClose}
        >
          Đã hiểu!
        </Button>
      </div>
    </Modal>
  );
}