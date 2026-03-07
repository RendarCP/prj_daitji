import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/server'
import NotificationsSettingsClient from './NotificationsSettingsClient'

export const metadata: Metadata = {
  title: '알림 설정',
  description: '알림 정책을 관리하세요',
}

export default async function NotificationSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/settings/notifications')
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <Link
            href="/settings"
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label="설정으로 돌아가기"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Link>
          <h1 className="mb-6 text-2xl font-bold text-foreground">알림 설정</h1>
          <NotificationsSettingsClient />
        </div>
      </div>
      <BottomNav />
    </>
  )
}
