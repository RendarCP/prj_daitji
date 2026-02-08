import { Metadata } from 'next'
import { ScanClient } from './ScanClient'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: '바코드 스캔 - DAITJI',
  description: '바코드를 스캔하여 물품을 빠르게 등록하세요',
}

export default function ScanPage() {
  return (
    <>
      <Header />
      <ScanClient />
    </>
  )
}
