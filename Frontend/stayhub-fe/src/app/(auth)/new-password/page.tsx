import { Suspense } from "react";
import NewPasswordForm from "./_components/NewPasswordForm";

export default function NewPasswordPage() {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-stone-800">Đặt lại mật khẩu</h2>
        <p className="text-stone-500 text-sm">
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="w-5 h-5 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        }
      >
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
