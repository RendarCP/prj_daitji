import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Spinner } from '@/components/ui/Spinner'

export default function ItemDetailLoading() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <main className="pb-24 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Loading State */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Spinner size="lg" className="mb-4" />
              <p className="text-secondary-600">물품 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
