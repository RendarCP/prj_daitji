import { Metadata } from 'next'
import { Suspense } from 'react'
import ExplorerClient from './ExplorerClient'
import { Spinner } from '@/components/ui/Spinner'

export const metadata: Metadata = {
  title: '물건 탐색',
  description: '위치별로 물건을 탐색하고 찾아보세요',
}

function ExplorerFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={<ExplorerFallback />}>
      <ExplorerClient />
    </Suspense>
  )
}
