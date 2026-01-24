import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";

export default function NewPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutWrapper 
      label={<>khách sạn Transylvania</>}
    >
      {children}
    </AuthLayoutWrapper>
  );
}