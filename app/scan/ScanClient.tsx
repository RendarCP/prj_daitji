'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScanBarcode, Camera, X } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export function ScanClient() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartScan = () => {
    setIsScanning(true)
    setError(null)
    // TODO: 카메라 스캔 기능 구현
    // 현재는 placeholder
    setTimeout(() => {
      setError('카메라 스캔 기능은 곧 제공될 예정입니다.')
      setIsScanning(false)
    }, 1000)
  }

  const handleStopScan = () => {
    setIsScanning(false)
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <main className="pb-24">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <PageHeader
            title="바코드 스캔"
            description="바코드를 스캔하여 물품을 빠르게 등록하세요"
            onBack={() => router.back()}
          />

          {error && (
            <Alert variant="info" className="mb-6">
              {error}
            </Alert>
          )}

          <Card>
            <div className="text-center py-12">
              {!isScanning ? (
                <>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 text-primary-600 mb-6">
                    <ScanBarcode className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    바코드 스캔 시작
                  </h2>
                  <p className="text-secondary-600 mb-8 max-w-md mx-auto">
                    물품의 바코드를 스캔하면 자동으로 정보를 가져와 등록할 수 있습니다.
                  </p>
                  <Button
                    size="lg"
                    leftIcon={<Camera className="w-5 h-5" />}
                    onClick={handleStartScan}
                  >
                    스캔 시작
                  </Button>
                </>
              ) : (
                <>
                  <div className="aspect-video bg-secondary-900 rounded-lg mb-6 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-white animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    바코드를 화면에 맞춰주세요
                  </h2>
                  <p className="text-secondary-600 mb-8">
                    바코드가 화면 중앙에 오도록 조정해주세요
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<X className="w-5 h-5" />}
                    onClick={handleStopScan}
                  >
                    취소
                  </Button>
                </>
              )}
            </div>
          </Card>

          <div className="mt-6">
            <Card>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                스캔 팁
              </h3>
              <ul className="space-y-2 text-secondary-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span>밝은 곳에서 스캔하면 더 정확합니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span>바코드가 화면 중앙에 오도록 조정하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span>카메라 렌즈를 깨끗이 닦아주세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span>바코드가 구겨지거나 손상되지 않았는지 확인하세요</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
