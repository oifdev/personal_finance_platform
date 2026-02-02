import Sidebar from "@/components/layout/sidebar"
import { AutoLogout } from "@/components/auth/auto-logout"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <AutoLogout />
            <Sidebar />
            <MobileNav />
            <main className="md:pl-64 min-h-screen">
                <div className="container max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
