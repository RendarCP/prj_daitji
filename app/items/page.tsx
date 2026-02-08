import { Metadata } from 'next'
import { ItemsClient } from './ItemsClient'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Items',
  description: '전체 물품 목록',
}

export default function ItemsPage() {
  return (
    <>
      <Header />
      <ItemsClient />
    </>
  )
}
