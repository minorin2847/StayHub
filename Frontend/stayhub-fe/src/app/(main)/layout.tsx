import { AuthProvider } from "@/context/AuthContext";
import MainHeader from "../../components/layout/MainHeader";
import MainFooter from "@/components/layout/MainFooter";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        {children}
        <MainFooter />
      </div>
    </AuthProvider>
  );
}
