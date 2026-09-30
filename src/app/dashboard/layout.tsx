import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { OnlineProvider } from '@/components/providers/OnlineProvider'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AuthProvider>
      <OnlineProvider>
        <div className="min-h-screen bg-background">
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Main content */}
          <main className="lg:pl-64 pb-20 lg:pb-0 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
          </main>

          {/* Mobile bottom nav */}
          <BottomNav />
        </div>
      </OnlineProvider>
    </AuthProvider>
  )
}
