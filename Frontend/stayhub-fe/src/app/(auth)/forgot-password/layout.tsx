import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";

export default function CustomerForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutWrapper 
      label={<>khách sạn Transylvania</>}
    >
      {children}
    </AuthLayoutWrapper>
  );
}