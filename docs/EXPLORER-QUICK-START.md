# Explorer 페이지 빠른 시작 가이드

## 🚀 바로 시작하기

### 개발 서버 실행

```bash
# 터미널에서 프로젝트 루트로 이동
cd /Users/choseongweek/Documents/my-project/prj-daitji

# Supabase 로컬 시작 (아직 실행 중이 아니라면)
npm run db:start

# Next.js 개발 서버 시작
npm run dev
```

### 페이지 접속

브라우저에서 접속: **http://localhost:3000/explorer**

## 📱 기능 테스트

### 1. 위치 탐색 테스트

#### Level 1 위치 카드 확인
- [ ] 페이지 로드 시 "위치 둘러보기" 섹션에 Level 1 위치들이 카드로 표시됨
- [ ] 각 카드에 아이콘, 이름, 물품 개수가 표시됨
- [ ] 카드 호버 시 효과 확인

#### 위치 선택
- [ ] 위치 카드 클릭 시 해당 위치의 물품 목록이 표시됨
- [ ] URL이 `?location_id=xxx`로 변경됨
- [ ] 브레드크럼에 현재 위치 경로가 표시됨

#### 사이드바 위치 트리
- [ ] 사이드바에 계층형 위치 트리가 표시됨
- [ ] 확장/축소 버튼(Chevron) 클릭 시 하위 위치 표시/숨김
- [ ] 위치 클릭 시 선택되고 하이라이트됨
- [ ] 물품 개수 뱃지가 표시됨

#### 브레드크럼 네비게이션
- [ ] 브레드크럼의 각 항목 클릭 시 해당 위치로 이동
- [ ] 홈 아이콘 클릭 시 최상위 뷰로 돌아감
- [ ] "전체 보기" 버튼으로 루트로 돌아가기

### 2. 물품 목록 테스트

#### 기본 표시
- [ ] 선택된 위치의 물품들이 그리드로 표시됨
- [ ] 각 물품 카드에 이름, 타입, 이미지, 수량 등이 표시됨
- [ ] "총 X개" 표시 확인

#### 뷰 모드 전환
- [ ] 그리드 뷰 버튼 클릭 (기본값)
- [ ] 리스트 뷰 버튼 클릭
- [ ] 뷰 모드 변경 시 레이아웃 변경 확인

#### 물품 클릭
- [ ] 물품 카드 클릭 시 상세 페이지로 이동 (`/item/[id]`)

### 3. 필터링 테스트

#### 검색
- [ ] 검색 입력창에 텍스트 입력
- [ ] 실시간으로 필터링된 결과 확인
- [ ] X 버튼으로 검색어 초기화

#### 필터 버튼
- [ ] "필터" 버튼 클릭 시 고급 필터 패널 펼쳐짐
- [ ] 활성화된 필터 개수가 뱃지로 표시됨

#### 타입 필터
- [ ] 식품, 화장품, 의약품, 일반 버튼 클릭
- [ ] 여러 타입 선택 가능
- [ ] 선택된 타입의 물품만 표시됨

#### 유통기한 필터
- [ ] 드롭다운에서 옵션 선택
  - 전체
  - 신선 (7일 이상)
  - 3일 이내 만료
  - 7일 이내 만료
  - 만료됨
- [ ] 선택한 조건의 물품만 표시됨

#### 필터 초기화
- [ ] "필터 초기화" 버튼으로 모든 필터 해제

### 4. 정렬 테스트

#### 정렬 옵션
- [ ] 드롭다운에서 정렬 옵션 선택
  - 이름 (가나다순)
  - 이름 (역순)
  - 최근 추가순
  - 오래된 순
  - 유통기한 임박순
- [ ] 선택한 정렬이 즉시 적용됨

### 5. 반응형 테스트

#### 데스크톱 (1024px 이상)
- [ ] 사이드바가 화면 왼쪽에 고정됨
- [ ] 메인 콘텐츠가 오른쪽에 표시됨
- [ ] 물품 그리드가 4열로 표시됨

#### 태블릿 (768px - 1023px)
- [ ] 물품 그리드가 2-3열로 조정됨
- [ ] 사이드바가 토글 가능

#### 모바일 (767px 이하)
- [ ] 상단에 "위치" 버튼이 표시됨
- [ ] "위치" 버튼 클릭 시 사이드바가 오버레이로 표시됨
- [ ] 배경 클릭 시 사이드바 닫힘
- [ ] 물품 그리드가 1-2열로 표시됨
- [ ] 터치 스크롤 동작 확인

### 6. 빠른 추가 버튼

#### 플로팅 버튼
- [ ] 화면 오른쪽 하단에 + 버튼이 표시됨
- [ ] + 버튼 클릭 시 옵션 메뉴가 펼쳐짐
- [ ] "물품 추가" 버튼 확인
- [ ] "위치 추가" 버튼 확인
- [ ] 다시 클릭하면 메뉴 닫힘

### 7. 로딩 및 에러 상태

#### 로딩 상태
- [ ] 페이지 로드 시 스피너 표시
- [ ] 위치 변경 시 로딩 인디케이터 표시
- [ ] 로딩 스켈레톤 UI 확인 (loading.tsx)

#### 에러 처리
- [ ] 네트워크 오류 시 Alert 표시
- [ ] "다시 시도" 버튼 동작 확인
- [ ] Error Boundary 동작 확인

#### 빈 상태
- [ ] 물품이 없을 때 EmptyState 표시
- [ ] "물품 추가하기" 버튼 표시
- [ ] 필터링 결과가 없을 때 안내 메시지

### 8. URL 상태 관리

#### 쿼리 파라미터
- [ ] 위치 선택 시 URL에 `?location_id=xxx` 추가
- [ ] 브라우저 뒤로가기로 이전 위치로 돌아가기
- [ ] 브라우저 앞으로가기로 다음 위치로 이동
- [ ] URL 직접 입력 시 해당 위치 표시

#### 딥링킹
- [ ] `http://localhost:3000/explorer?location_id={id}` 직접 접속
- [ ] 해당 위치가 선택된 상태로 페이지 로드

## 🐛 알려진 이슈 및 제한사항

### 현재 미구현 기능
1. **위치 생성/수정/삭제**: 모달이 아직 구현되지 않음
2. **물품 추가 모달**: QuickAddButton이 홈으로 리다이렉트
3. **페이지네이션**: 모든 물품을 한 번에 로드
4. **무한 스크롤**: 아직 미구현

### 개선 필요 사항
1. **성능**: 물품이 많을 경우 로딩 시간 증가
2. **검색**: 디바운싱 미적용
3. **캐싱**: API 응답 캐싱 미적용

## 🔍 디버깅 팁

### 브라우저 개발자 도구

```javascript
// Console에서 현재 상태 확인
console.log('Current URL:', window.location.href)
console.log('Search Params:', new URLSearchParams(window.location.search))

// Network 탭에서 API 호출 확인
// - /api/locations?tree=true
// - /api/locations/[id]/path
// - /api/items?location_id=xxx
```

### React DevTools
- Components 탭에서 ExplorerClient 컴포넌트 선택
- Props와 State 확인
  - `locations`: 위치 트리 데이터
  - `items`: 현재 물품 목록
  - `filteredItems`: 필터링된 물품 목록
  - `selectedLocationId`: 선택된 위치 ID
  - `filters`: 현재 필터 상태

### Supabase 데이터 확인

```bash
# Supabase Studio 접속
# http://localhost:54323

# SQL Editor에서 실행
SELECT * FROM locations ORDER BY level, sort_order;
SELECT * FROM items WHERE location_id = 'your-location-id';
```

## 📊 성능 측정

### Lighthouse 점수 목표
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### 측정 방법
```bash
# Chrome DevTools > Lighthouse
# 또는 터미널에서
npm install -g lighthouse
lighthouse http://localhost:3000/explorer
```

## 🎯 다음 단계

1. **위치 관리 모달 구현**
   - 위치 생성 폼
   - 위치 수정 기능
   - 위치 삭제 확인

2. **물품 추가 모달 구현**
   - QuickAddButton 통합
   - 현재 위치에 물품 추가

3. **고급 기능**
   - 드래그 앤 드롭으로 물품 이동
   - 즐겨찾기 위치
   - 최근 방문 위치

4. **성능 최적화**
   - 무한 스크롤
   - 이미지 레이지 로딩
   - API 응답 캐싱

## 📞 문제 해결

### 일반적인 문제

#### 1. 페이지가 로드되지 않음
```bash
# Supabase 상태 확인
npm run db:status

# Supabase 재시작
npm run db:stop
npm run db:start

# Next.js 개발 서버 재시작
npm run dev
```

#### 2. 위치 트리가 표시되지 않음
```bash
# 샘플 데이터 확인
npm run db:reset
```

#### 3. API 에러
- Network 탭에서 응답 확인
- Console에서 에러 메시지 확인
- Supabase 로그 확인

## 📚 추가 자료

- [Explorer 구현 문서](./EXPLORER-IMPLEMENTATION.md)
- [API 문서](./API.md)
- [컴포넌트 가이드](./COMPONENTS.md)

---

**마지막 업데이트**: 2026-02-02  
**작성자**: DAITJI Team
