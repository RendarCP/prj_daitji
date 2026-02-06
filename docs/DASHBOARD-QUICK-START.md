# Dashboard 페이지 - Quick Start Guide

## 🚀 빠른 시작

### 1. 개발 환경 실행

```bash
# Supabase 로컬 데이터베이스 시작
npm run db:start

# Next.js 개발 서버 실행
npm run dev
```

### 2. 페이지 접속

브라우저에서 다음 주소로 접속:

```
http://localhost:3000/dashboard
```

## 📁 파일 위치

```
app/dashboard/
├── page.tsx              # 메인 페이지 (Server Component)
├── DashboardClient.tsx   # 클라이언트 컴포넌트
├── loading.tsx           # 로딩 UI
└── error.tsx             # 에러 UI
```

## 🔍 주요 기능

### 1. 통계 카드 (5개)
- 전체 물품 수
- 활성 물품 수
- 만료 임박 물품 수 (7일)
- 만료된 물품 수
- 위치 개수

### 2. 만료 임박 물품 리스트
- D-Day 순서로 정렬
- 물품 카드로 표시
- 클릭 시 상세 페이지 이동

### 3. 최근 등록 물품
- 최근 5개 물품
- 등록일 기준 정렬
- 전체보기 버튼

### 4. 위치별 물품 요약
- Level 1 위치만 표시
- 물품 개수 표시
- 클릭 시 Explorer 이동

## 🛠️ 커스터마이징

### 만료 임박 기준 변경

`app/dashboard/page.tsx`:
```typescript
// 7일 → 14일로 변경
const { data } = await supabase
  .rpc('get_expiring_items', { days_threshold: 14 }) // 7 → 14
```

### 최근 물품 개수 변경

`app/dashboard/page.tsx`:
```typescript
// 5개 → 10개로 변경
.limit(10)  // 5 → 10
```

### 통계 카드 색상 변경

`app/dashboard/DashboardClient.tsx`:
```typescript
// Primary → Success로 변경
<div className="p-2 bg-success-100 rounded-lg">
  <Package className="w-5 h-5 text-success-600" />
</div>
```

## 🐛 문제 해결

### 데이터가 표시되지 않을 때

1. **Supabase 실행 확인**:
   ```bash
   npm run db:status
   ```

2. **샘플 데이터 확인**:
   ```bash
   npm run db:reset
   ```

3. **환경 변수 확인**:
   `.env.local` 파일에 다음이 있는지 확인:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 에러가 발생할 때

1. **브라우저 콘솔 확인**: F12 → Console 탭
2. **서버 로그 확인**: 터미널에서 에러 메시지 확인
3. **타입 체크**: `npm run type-check`

### 스타일이 깨질 때

1. **Tailwind 빌드**: 개발 서버 재시작
2. **브라우저 캐시 삭제**: Ctrl+Shift+R (하드 리프레시)

## 📊 데이터 흐름 이해하기

```
┌──────────────┐
│  page.tsx    │ ← Server Component
│  (서버)      │   - 데이터 페칭
└──────┬───────┘   - 에러 처리
       │
       ▼
┌──────────────┐
│DashboardClient│ ← Client Component
│  (클라이언트) │   - UI 렌더링
└──────────────┘   - 사용자 인터랙션
```

## 🎨 스타일 가이드

### 색상 시스템

```typescript
// Primary (파란색) - 기본, 위치
bg-primary-100, text-primary-600

// Success (초록색) - 활성, 신선
bg-success-100, text-success-600

// Warning (노란색) - 만료 임박
bg-warning-100, text-warning-600

// Danger (빨간색) - 만료, 에러
bg-danger-100, text-danger-600

// Secondary (회색) - 기본 텍스트, 배경
bg-secondary-100, text-secondary-600
```

### 그리드 시스템

```typescript
// 통계 카드
grid-cols-2 md:grid-cols-3 lg:grid-cols-5

// 물품 카드
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

## 📱 반응형 테스트

### 브라우저 개발자 도구

1. F12 열기
2. Device Toolbar 활성화 (Ctrl+Shift+M)
3. 다양한 디바이스 크기 테스트:
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1280px)

### 체크 포인트

- [ ] 통계 카드: 모바일 2열 → 데스크톱 5열
- [ ] 물품 카드: 모바일 1열 → 데스크톱 4열
- [ ] BottomNav: 모바일만 표시
- [ ] QuickAddButton: 모든 화면에서 표시

## 🧪 테스트 시나리오

### 1. 정상 케이스
```
✓ Dashboard 접속
✓ 통계 카드 5개 표시
✓ 만료 임박 물품 표시
✓ 최근 물품 표시
✓ 위치별 요약 표시
```

### 2. 빈 데이터 케이스
```
✓ 통계 0으로 표시
✓ "만료 임박 물품 없음" 메시지
✓ "등록된 물품 없음" + 추가 버튼
```

### 3. 인터랙션 테스트
```
✓ 새로고침 버튼 클릭
✓ 물품 카드 클릭 → 상세 페이지 이동
✓ QuickAddButton → 물품/위치 추가
✓ "전체보기" 버튼 → 목록 페이지 이동
```

## 💡 팁 & 트릭

### 개발 시 유용한 단축키

```
Ctrl+Shift+R  - 하드 리프레시 (캐시 무시)
Ctrl+Shift+I  - 개발자 도구
Ctrl+Shift+M  - 반응형 모드
```

### VSCode 확장 프로그램

```
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
```

### 코드 스니펫

새 섹션 추가:
```typescript
<section className="mb-8 animate-fade-in">
  <Card>
    <CardHeader>
      <CardTitle>새 섹션 제목</CardTitle>
    </CardHeader>
    <CardContent>
      {/* 내용 */}
    </CardContent>
  </Card>
</section>
```

## 🔗 관련 문서

- [상세 구현 문서](./DASHBOARD-IMPLEMENTATION.md)
- [API 문서](./API.md)
- [컴포넌트 가이드](./COMPONENTS.md)

## 🆘 도움이 필요하면

1. 문서 먼저 확인: `docs/` 폴더
2. 코드 주석 확인: 각 파일 상단
3. 에러 메시지 읽기: 개발자 도구 콘솔
4. 데이터베이스 확인: Supabase Studio

---

**Happy Coding!** 🚀
