import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Settings',
  description: '설정',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/settings')
  }

  return <SettingsClient />
}
