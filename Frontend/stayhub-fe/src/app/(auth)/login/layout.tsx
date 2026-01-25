import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";

export default function CustomerLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutWrapper 
      label={<>StayHub</>}
    >
      {children}
    </AuthLayoutWrapper>
  );
}