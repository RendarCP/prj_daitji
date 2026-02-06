import { Package, Home } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ItemNotFound() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <main className="pb-24 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card>
            <EmptyState
              icon={<Package className="w-16 h-16" />}
              title="물품을 찾을 수 없습니다"
              description="요청하신 물품이 존재하지 않거나 삭제되었습니다."
            />
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <Link href="/explorer">
                <Button
                  variant="primary"
                  leftIcon={<Package className="w-4 h-4" />}
                >
                  물품 탐색
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  대시보드
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
