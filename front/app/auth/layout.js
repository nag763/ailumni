import AuthGuard from "@/components/AuthGuard";

export default function RootLayout({ children }) {
    return <AuthGuard>
        {children}
    </AuthGuard>
}