import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
      <BottomNav />
    </>
  )
}
