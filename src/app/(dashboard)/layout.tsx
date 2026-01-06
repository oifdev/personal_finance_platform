import Sidebar from "@/components/layout/sidebar"
import { AutoLogout } from "@/components/auth/auto-logout"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <AutoLogout />
            <Sidebar />
            <main className="md:pl-64 min-h-screen">
                <div className="container max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
