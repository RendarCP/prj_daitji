# 🏠 DAITJI (다있지)

> **"우리 집 모든 물건, 어디 있는지 다 있지!"**

집안 물건의 위치를 추적하고 유통기한을 관리하는 스마트 재고 관리 시스템

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [빠른 시작](#-빠른-시작)
- [프로젝트 구조](#-프로젝트-구조)
- [문서](#-문서)
- [스크린샷](#-스크린샷)
- [로드맵](#-로드맵)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

---

## 🎯 소개

DAITJI는 현대 가정의 물건 관리 문제를 해결하기 위한 웹 애플리케이션입니다.

### 해결하는 문제

- 🤔 "이거 어디 뒀더라?" - 물건 위치를 기억하지 못하는 문제
- ⏰ "이거 언제까지야?" - 유통기한을 놓치는 문제
- 📦 "뭐가 있었더라?" - 보유한 물건을 파악하지 못하는 문제

### 제공하는 가치

- 🏠 **체계적인 위치 관리**: 방 > 가구 > 칸까지 계층형 구조
- ⏰ **자동 만료일 계산**: 식품, 화장품, 의약품 타입별 지능형 계산
- 📊 **시각적 대시보드**: 한눈에 보는 재고 현황
- 🔍 **강력한 검색**: 이름, 타입, 위치, 태그로 즉시 검색

---

## ✨ 주요 기능

### 1. 📍 계층형 위치 관리

- 최대 5단계 깊이의 위치 구조
- 예: 주방 > 냉장고 > 냉장실 > 상단 칸
- 아이콘과 색상으로 시각적 구분

### 2. 📦 스마트 물품 관리

- **4가지 타입**: 식품, 화장품, 의약품, 일반
- **자동 만료일 계산**:
  - 식품: 유통기한 기준
  - 화장품: 개봉일 + PAO (Period After Opening)
  - 의약품: 유효기한 기준
  - 일반: 보증기간 (선택)

### 3. ⏰ 유통기한 알림

- **3단계 상태 표시**:
  - 🟢 신선 (7일 이상)
  - 🟡 임박 (1-7일)
  - 🔴 만료 (0일 이하)
- 대시보드에 만료 임박 물품 표시

### 4. 🔍 강력한 검색 및 필터

- 이름 검색
- 타입 필터 (식품, 화장품, 의약품, 일반)
- 상태 필터 (활성, 소진, 만료, 폐기)
- 위치 필터
- 유통기한 필터 (만료 임박만)
- 다중 정렬 (이름, 날짜, 유통기한)

### 5. 📱 반응형 디자인

- 모바일, 태블릿, 데스크톱 완벽 지원
- 터치 친화적 UI
- 하단 네비게이션 (모바일)

---

## 🛠️ 기술 스택

### Frontend

- **Next.js 16.1** - App Router, Server/Client Components
- **React 19** - 최신 React 기능
- **TypeScript 5.9** - 타입 안정성
- **Tailwind CSS 3.4** - 유틸리티 우선 스타일링
- **Lucide React** - 아이콘 라이브러리

### Backend

- **Supabase** - PostgreSQL 데이터베이스
- **Next.js API Routes** - RESTful API

### Development

- **ESLint 9** - 코드 품질
- **date-fns 4** - 날짜 처리
- **Zod 3** - 스키마 유효성 검사

---

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 20.x 이상
- npm 또는 yarn
- Supabase 계정

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/prj-daitji.git
cd prj-daitji

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase URL/KEY 입력

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### Supabase 설정

✅ **프로젝트가 이미 설정되었습니다!**

- **프로젝트 ID**: raqcqnoipwgbmdqcskhj
- **리전**: ap-northeast-2 (Seoul)
- **상태**: ACTIVE_HEALTHY
- **데이터베이스**: 마이그레이션 적용 완료
- **환경 변수**: `.env.local` 생성 완료

바로 개발 서버를 실행하세요:

```bash
npm run dev
```

**상세 가이드**: [supabase/QUICKSTART.md](supabase/QUICKSTART.md)

### 주요 명령어

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run type-check   # TypeScript 타입 체크
npm run lint         # ESLint 실행

# Supabase 관련
npm run db:start     # 로컬 Supabase 시작
npm run db:types     # TypeScript 타입 생성
npm run db:reset     # 데이터베이스 리셋
```

---

## 📁 프로젝트 구조

```
prj-daitji/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 대시보드 페이지
│   ├── explorer/          # 위치 탐색 페이지
│   ├── item/              # 물품 관리 페이지
│   └── api/               # API Routes
│
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── features/         # Feature 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
│
├── lib/                   # 라이브러리
│   ├── supabase/         # Supabase 클라이언트
│   ├── types/            # TypeScript 타입
│   ├── validations/      # Zod 스키마
│   └── utils/            # 유틸리티 함수
│
├── supabase/             # Supabase 관련
│   └── migrations/       # DB 마이그레이션
│
└── docs/                 # 문서
```

**상세 구조**: [PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md)

---

## 📚 문서

### 사용자 가이드

- [빠른 시작 가이드](supabase/QUICKSTART.md) - 5분 내 설정
- [사용 설명서](docs/USER-GUIDE.md) - 기능별 사용법 (예정)

### 개발자 가이드

- [API 문서](docs/API.md) - 전체 API 엔드포인트
- [컴포넌트 가이드](docs/COMPONENTS.md) - 컴포넌트 사용법
- [API 아키텍처](docs/API-ARCHITECTURE.md) - API 설계 문서

### 구현 가이드

- [Dashboard 구현](docs/DASHBOARD-IMPLEMENTATION.md)
- [Explorer 구현](docs/EXPLORER-IMPLEMENTATION.md)
- [Item 페이지 구현](docs/ITEM-PAGES-IMPLEMENTATION.md)

### 프로젝트 문서

- [프로젝트 기획서](PROJECT.md) - 원본 기획
- [구현 완료 문서](docs/archive/) - 구현 내역 아카이브

---

## 📸 스크린샷

### 대시보드

![Dashboard](docs/screenshots/dashboard.png)
_유통기한 임박 물품과 통계를 한눈에_

### Explorer

![Explorer](docs/screenshots/explorer.png)
_계층형 위치 탐색과 물품 목록_

### 물품 상세

![Item Detail](docs/screenshots/item-detail.png)
_상세 정보와 인라인 수정_

---

## 🗺️ 로드맵

### ✅ 1차 MVP (완료)

- [x] Next.js 프로젝트 초기화
- [x] Supabase 데이터베이스 구축
- [x] 기본 CRUD 기능
- [x] Dashboard, Explorer, Item 페이지
- [x] 유통기한 관리 시스템

### 🚧 2차 계획 (진행 예정)

- [ ] 사용자 인증 (Supabase Auth)
- [ ] 구글/카카오 로그인
- [ ] Row Level Security (RLS)
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] React Native 웹뷰 통합
- [ ] 위치 생성/수정/삭제 UI

### 🔮 3차 계획 (향후)

- [ ] 바코드 스캔 (Open Food Facts)
- [ ] OCR 유통기한 인식
- [ ] AI 레시피 추천
- [ ] 장보기 목록 자동 생성
- [ ] PWA 변환

**상세 로드맵**: [PROJECT.md](PROJECT.md)

---

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**기여 가이드**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🐛 버그 리포트

버그를 발견하셨나요? [GitHub Issues](https://github.com/your-username/prj-daitji/issues)에 제보해주세요.

---

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 👨‍💻 제작자

**DAITJI Team**

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들 덕분에 가능했습니다:

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/)
- [date-fns](https://date-fns.org/)

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 [Issues](https://github.com/your-username/prj-daitji/issues)를 통해 연락해주세요.

---

**Made with ❤️ by DAITJI Team**

---

## 📈 프로젝트 상태

- **상태**: 1차 MVP 완성 ✅
- **버전**: 1.0.0
- **최종 업데이트**: 2026-02-06
- **라이브 데모**: [daitji.vercel.app](https://daitji.vercel.app) (예정)

---

**시작해보세요! 🚀**

```bash
npm run dev
```

그리고 http://localhost:3000 에서 DAITJI를 경험하세요!
