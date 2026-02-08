import { Metadata } from 'next'
import { SettingsClient } from './SettingsClient'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Settings',
  description: '설정',
}

export default function SettingsPage() {
  return (
    <>
      <Header />
      <SettingsClient />
    </>
  )
}
