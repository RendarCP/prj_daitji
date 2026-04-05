import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'

export default function ExplorerV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title="DAITJI" subtitle="Browse V2" />
      {children}
      <BottomNav />
    </>
  )
}
