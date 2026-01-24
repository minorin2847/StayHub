import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";

export default function CustomerRegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutWrapper 
      label={<>StayHub</>}
    >
      {children}
    </AuthLayoutWrapper>
  );
}