import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/server'
import SendUserNotificationTestClient from './SendUserNotificationTestClient'

export const metadata: Metadata = {
  title: '특정 유저 푸시 테스트',
  description: '특정 유저에게 Web Push 테스트 메시지를 발송합니다',
}

export default async function SendUserNotificationTestPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/settings/notifications/send-test')
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <Link
            href="/settings/notifications"
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label="알림 설정으로 돌아가기"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Link>
          <h1 className="mb-6 text-2xl font-bold text-foreground">특정 유저 푸시 테스트</h1>
          <SendUserNotificationTestClient />
        </div>
      </div>
      <BottomNav />
    </>
  )
}
