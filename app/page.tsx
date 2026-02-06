import Link from 'next/link'
import { ArrowRight, Package, MapPin, Clock, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl font-bold text-secondary-900 mb-4">
          집안 물건, <span className="text-primary-600">다있지</span>에서
        </h1>
        <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
          물건의 위치를 기억하고, 수명을 관리하며, 필요한 것을 빠르게 찾아보세요
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/dashboard" 
            className="btn-primary inline-flex items-center gap-2"
          >
            시작하기 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/explorer" 
            className="btn-outline inline-flex items-center gap-2"
          >
            물건 둘러보기 <Search className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">물건 관리</h3>
          <p className="text-secondary-600">
            집안의 모든 물건을 체계적으로 등록하고 관리하세요
          </p>
        </div>

        <div className="card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">위치 추적</h3>
          <p className="text-secondary-600">
            물건이 어디에 있는지 한눈에 파악하고 빠르게 찾아보세요
          </p>
        </div>

        <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">수명 관리</h3>
          <p className="text-secondary-600">
            구매일, 유통기한, 보증기간을 관리하고 알림을 받으세요
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">
            DAITJI와 함께 더 나은 생활을
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-sm text-secondary-600">등록된 물건</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-sm text-secondary-600">저장된 위치</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-sm text-secondary-600">활성 알림</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
