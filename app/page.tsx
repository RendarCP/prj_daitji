import Link from 'next/link'
import { ArrowRight, Package, MapPin, Clock, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            집안 물건, <span className="gradient-text">다있지</span>에서
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            물건의 위치를 기억하고, 수명을 관리하며, 필요한 것을 빠르게 찾아보세요
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link 
              href="/dashboard" 
              className="btn-primary inline-flex items-center gap-2"
            >
              시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/explorer" 
              className="btn-outline inline-flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              물건 둘러보기
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 mb-16 stagger-children">
          <div className="card text-center hover-lift">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">물건 관리</h3>
            <p className="text-sm text-muted-foreground">
              집안의 모든 물건을 체계적으로 등록하고 관리하세요
            </p>
          </div>

          <div className="card text-center hover-lift">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10 text-success mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">위치 추적</h3>
            <p className="text-sm text-muted-foreground">
              물건이 어디에 있는지 한눈에 파악하고 빠르게 찾아보세요
            </p>
          </div>

          <div className="card text-center hover-lift">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 text-warning mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">수명 관리</h3>
            <p className="text-sm text-muted-foreground">
              구매일, 유통기한, 보증기간을 관리하고 알림을 받으세요
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="card glass animate-scale-in">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              DAITJI와 함께 더 나은 생활을
            </h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">0</div>
                <div className="text-sm text-muted-foreground">등록된 물건</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">0</div>
                <div className="text-sm text-muted-foreground">저장된 위치</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-2">0</div>
                <div className="text-sm text-muted-foreground">활성 알림</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
