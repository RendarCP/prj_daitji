import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DAITJI - 다있지',
    short_name: 'DAITJI',
    description: '집안 물건의 위치와 수명을 관리하는 하이브리드 앱',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1112',
    theme_color: '#0b1112',
    lang: 'ko',
    categories: ['productivity', 'utilities', 'lifestyle'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: '대시보드',
        short_name: '대시보드',
        description: '물건 현황을 바로 확인합니다.',
        url: '/dashboard',
      },
      {
        name: '물건 목록',
        short_name: '물건',
        description: '등록된 물건을 빠르게 조회합니다.',
        url: '/items',
      },
      {
        name: '탐색기',
        short_name: '탐색기',
        description: '위치별 물건을 탐색합니다.',
        url: '/explorer',
      },
    ],
  }
}
