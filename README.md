# DAITJI (다있지)

> 우리 집 모든 물건, 어디 있는지 다 있지!

집안 물건의 위치, 수량, 이미지, 바코드, 유통기한과 알림을 관리하는 가정용 재고 관리 웹앱입니다. Next.js App Router와 Supabase를 기반으로 동작하며, PWA 설치와 웹 푸시 알림 흐름을 포함합니다.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 주요 기능

- 계층형 위치 관리: 방, 가구, 칸처럼 여러 단계의 보관 위치를 구성합니다.
- 물품 관리: 이름, 타입, 수량, 위치, 이미지, 바코드, 태그, 메모를 관리합니다.
- 유통기한/소진 관리: 식품, 화장품, 의약품, 일반 물품의 날짜와 상태를 추적합니다.
- 대시보드: 전체 물품 수, 위치별 현황, 최근 추가 물품, 만료 임박 항목을 요약합니다.
- 탐색기: 위치 트리와 물품 목록을 함께 탐색합니다.
- 바코드 스캔: `/scan`에서 스캔한 값을 `/items/add?barcode=...` 등록 흐름으로 연결합니다.
- 인증: 로그인, 회원가입, OAuth, 비밀번호 재설정, 계정 보안 화면을 제공합니다.
- 알림 설정: 만료 임박/재고 부족 알림 설정, 웹 푸시 구독, 테스트 발송 API를 제공합니다.
- 이미지 업로드: Cloudflare R2 호환 S3 presigned URL을 통해 물품 이미지를 업로드합니다.
- PWA: manifest, service worker, 앱 아이콘, 오프라인 페이지를 포함합니다.

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript 5.9
- Tailwind CSS 3.4
- Supabase Auth/Postgres
- TanStack Query
- Zod
- Cloudflare R2 호환 S3 업로드
- Web Push

## 빠른 시작

### 요구 사항

- Node.js 20 이상
- npm
- Supabase 프로젝트 또는 로컬 Supabase CLI

### 설치

```bash
git clone https://github.com/RendarCP/prj_daitji.git
cd prj_daitji
npm install
```

`.env.local`을 만들고 필요한 값을 설정합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

이미지 업로드를 사용하려면 다음 값도 필요합니다.

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

웹 푸시를 사용하려면 VAPID 키를 생성하고 설정합니다.

```bash
npm run notifications:vapid
```

```bash
WEB_PUSH_PUBLIC_KEY=
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:you@example.com
CRON_SECRET=
```

### 개발 서버

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주요 명령어

```bash
npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드
npm run start            # 빌드된 앱 실행
npm run lint             # ESLint
npm run type-check       # TypeScript 검사

npm run db:start         # 로컬 Supabase 시작
npm run db:stop          # 로컬 Supabase 중지
npm run db:migration:up  # 마이그레이션 적용
npm run db:types         # 로컬 DB 타입 생성
npm run db:types:remote  # 원격 DB 타입 생성

npm run workflow:new -- feature-slug
npm run workflow:plan -- feature-slug
npm run workflow:verify
npm run workflow:commit -- "feat: add feature"
```

## 개발 워크플로우

새 기능은 반드시 workflow 스크립트로 시작합니다.

```bash
npm run workflow:new -- favorite-locations
```

이 명령은 `feature/favorite-locations` 브랜치를 만들고 `docs/plans/favorite-locations.md` 계획 문서를 생성합니다. 구현 전 계획 문서에는 범위, 비범위, 모호함 로그, TDD 계획, QA 계획, 담당 에이전트 팀을 채워야 합니다.

TDD는 수직 슬라이스로 진행합니다.

1. 하나의 행동 테스트 또는 자동화 체크를 추가합니다.
2. 통과에 필요한 최소 구현을 합니다.
3. 다음 행동으로 반복합니다.
4. 모든 체크가 통과한 뒤 리팩터링합니다.

커밋은 workflow 스크립트로 수행합니다.

```bash
npm run workflow:commit -- "fix: correct item expiry state"
```

이 스크립트는 `main`/`master`에서 커밋을 차단하고 Conventional Commits 형식을 검사합니다.

자세한 절차는 [docs/process/feature-workflow.md](docs/process/feature-workflow.md)를 참고하세요.

## 검증

기본 검증:

```bash
npm run workflow:verify
```

이 명령은 workflow 스크립트 테스트, lint, type-check, build를 실행합니다.

UI, 라우팅, 폼, 모달, 브라우저 동작을 바꾼 경우 Playwright MCP로 실제 브라우저 QA를 수행합니다.

- 체크리스트: [docs/process/playwright-mcp-qa.md](docs/process/playwright-mcp-qa.md)
- 자동화 테스트: `npm run test:workflow`

## 프로젝트 구조

```text
prj-daitji/
├── app/                    # Next.js App Router pages, layouts, route handlers
├── components/             # UI, feature, layout components
├── lib/                    # hooks, server logic, Supabase, API helpers, utils, types
├── public/                 # PWA assets, service worker, offline page
├── scripts/                # DB and workflow automation scripts
├── supabase/               # migrations and Supabase setup docs
└── docs/                   # plans, process docs, agent docs
```

폴더별 개발 지침은 각 디렉터리의 `AGENTS.md`를 확인합니다.

- [AGENTS.md](AGENTS.md)
- [app/AGENTS.md](app/AGENTS.md)
- [components/AGENTS.md](components/AGENTS.md)
- [lib/AGENTS.md](lib/AGENTS.md)
- [supabase/AGENTS.md](supabase/AGENTS.md)
- [docs/AGENTS.md](docs/AGENTS.md)
- [scripts/AGENTS.md](scripts/AGENTS.md)

## 주요 라우트

- `/login`, `/signup`, `/auth/forgot-password`, `/auth/reset-password`
- `/dashboard`
- `/explorer`, `/explorer/add`
- `/items`, `/items/add`
- `/item/[id]`, `/item/[id]/edit`
- `/scan`
- `/settings`, `/settings/account`, `/settings/notifications`

## API 라우트

- `GET/POST /api/items`
- `GET/PATCH/DELETE /api/items/[id]`
- `GET /api/items/[id]/detail`
- `GET /api/items/expiring`
- `GET/POST /api/locations`
- `GET/PATCH/DELETE /api/locations/[id]`
- `GET /api/locations/[id]/path`
- `GET /api/stats/dashboard`
- `POST /api/uploads/presign`
- `GET/PATCH /api/settings/notifications`
- `GET /api/settings/notifications/web-push-key`
- `GET/POST/DELETE /api/settings/notifications/push-subscription`
- `POST /api/settings/notifications/test`
- `POST /api/settings/notifications/send-test`
- `POST /api/cron/notifications`

## 문서

- [프로젝트 기획서](PROJECT.md)
- [Supabase 빠른 시작](supabase/QUICKSTART.md)
- [Supabase 마이그레이션](supabase/migrations/README.md)
- [Supabase 보안 메모](supabase/SECURITY-NOTES.md)
- [기능 워크플로우](docs/process/feature-workflow.md)
- [Playwright MCP QA](docs/process/playwright-mcp-qa.md)
- [빠른 기능 후보](docs/plans/quick-win-features.md)
- [영향도 로드맵](docs/plans/impact-roadmap.md)

## 로드맵

### 완료

- 기본 CRUD, 대시보드, 탐색기, 물품 상세/등록
- Supabase 기반 인증 흐름
- 설정/계정/알림 화면
- 웹 푸시 알림 설정과 테스트 발송
- 바코드 스캔에서 물품 등록으로 연결
- 이미지 업로드 presigned URL API
- PWA manifest/service worker
- 에이전트 기반 기능 workflow 자동화

### 다음 후보

- 스캔 결과 기반 빠른 등록 보조
- 알림 센터 요약 화면
- 즐겨찾기 위치/물품
- 최근 본 물품/위치
- 대량 선택 후 일괄 이동/삭제/상태 변경

자세한 후보는 [docs/plans/quick-win-features.md](docs/plans/quick-win-features.md)를 참고하세요.

## 기여

1. `npm run workflow:new -- <feature-slug>`로 기능 브랜치와 계획 문서를 만듭니다.
2. 계획 문서에서 모호함을 정리합니다.
3. TDD 방식으로 구현합니다.
4. `npm run workflow:verify`와 필요한 Playwright MCP QA를 실행합니다.
5. `npm run workflow:commit -- "<type>: <summary>"`로 커밋합니다.
6. 브랜치를 푸시하고 PR을 엽니다.

커밋 메시지는 Conventional Commits를 따릅니다.

## 라이선스

MIT License. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.

## 프로젝트 상태

- 상태: 기능 확장 및 운영 자동화 정비 중
- 버전: 1.0.0
- 최종 업데이트: 2026-05-13
- 라이브 데모: [daitji.vercel.app](https://daitji.vercel.app) 예정
