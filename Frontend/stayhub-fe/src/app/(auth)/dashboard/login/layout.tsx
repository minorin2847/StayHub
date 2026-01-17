import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutWrapper
      label="Hệ thống quản lý"
      brandName="StayHub Admin"       
      subBrand="Internal System"      
    >
      {children}
    </AuthLayoutWrapper>
  );
}