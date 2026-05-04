import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { Header } from '@/components/layout/Header'
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
      <div className="min-h-screen bg-background pb-8 overscroll-none">
        <div className="fixed inset-x-0 top-14 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md sm:top-16">
          <div className="container mx-auto max-w-3xl px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-label="설정으로 돌아가기"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Link>
              <Link
                href="/settings/notifications/send-test"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/20"
              >
                <Send className="h-4 w-4" />
                유저 푸시 테스트
              </Link>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="h-[53px] w-full sm:h-[57px]"
        />
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <NotificationsSettingsClient />
        </div>
      </div>
    </>
  )
}
