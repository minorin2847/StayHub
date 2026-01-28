import { AuthProvider } from "@/context/AuthContext";
import MainHeader from "./_components/MainHeader";

export default function MainLayout({children}: {children: React.ReactNode}) {
    return (
        <>
        <AuthProvider>
            <MainHeader />
        </AuthProvider>
        <div>
            {children}
        </div>
        </>
    )
}