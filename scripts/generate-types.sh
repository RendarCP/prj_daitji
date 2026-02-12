#!/bin/bash

# ============================================================================
# DAITJI - TypeScript 타입 생성 스크립트
# ============================================================================
# Description: Supabase 데이터베이스 스키마로부터 TypeScript 타입 자동 생성
# Usage: ./scripts/generate-types.sh [--local|--remote]
# ============================================================================

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 로그 출력
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

# 함수: Supabase CLI 설치 확인
check_supabase_cli() {
  if ! command -v supabase &> /dev/null; then
    log_error "Supabase CLI가 설치되지 않았습니다."
    echo ""
    echo "설치 방법:"
    echo "  # Homebrew (macOS)"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo "  # npm"
    echo "  npm install -g supabase"
    echo ""
    exit 1
  fi
  
  log_success "Supabase CLI 설치 확인 완료: $(supabase --version)"
}

# 함수: 타입 생성 (로컬)
generate_types_local() {
  log_info "로컬 Supabase 데이터베이스에서 TypeScript 타입 생성 중..."
  
  # 로컬 Supabase 실행 확인
  if ! supabase status &> /dev/null; then
    log_warning "로컬 Supabase가 실행 중이지 않습니다. 시작합니다..."
    supabase start
  fi
  
  # 타입 생성
  supabase gen types typescript --local > lib/types/database.types.ts
  
  log_success "TypeScript 타입 생성 완료: lib/types/database.types.ts"
}

# 함수: 타입 생성 (원격)
generate_types_remote() {
  log_info "원격 Supabase 프로젝트에서 TypeScript 타입 생성 중..."
  
  # .env.local 파일에서 프로젝트 URL 추출
  if [ -f ".env.local" ]; then
    PROJECT_URL=$(grep SUPABASE_URL .env.local | cut -d '=' -f2 | tr -d '"' | tr -d ' ')
    
    if [ -z "$PROJECT_URL" ]; then
      log_error ".env.local 파일에서 SUPABASE_URL을 찾을 수 없습니다."
      exit 1
    fi
    
    # URL에서 프로젝트 레퍼런스 추출 (예: https://abcdefgh.supabase.co -> abcdefgh)
    PROJECT_REF=$(echo $PROJECT_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
    
    log_info "프로젝트 레퍼런스: $PROJECT_REF"
  else
    log_error ".env.local 파일을 찾을 수 없습니다."
    echo ""
    echo "다음 명령어를 사용하여 수동으로 생성하세요:"
    echo "  supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/types/database.types.ts"
    exit 1
  fi
  
  # 타입 생성
  supabase gen types typescript --project-id "$PROJECT_REF" > lib/types/database.types.ts
  
  log_success "TypeScript 타입 생성 완료: lib/types/database.types.ts"
}

# 함수: 생성된 타입 검증
validate_generated_types() {
  log_info "생성된 타입 파일 검증 중..."
  
  if [ ! -f "lib/types/database.types.ts" ]; then
    log_error "타입 파일이 생성되지 않았습니다."
    exit 1
  fi
  
  # 파일 크기 확인
  FILE_SIZE=$(wc -c < lib/types/database.types.ts)
  if [ "$FILE_SIZE" -lt 100 ]; then
    log_error "타입 파일이 비정상적으로 작습니다. 생성 과정에서 오류가 발생했을 수 있습니다."
    exit 1
  fi
  
  # 주요 타입 존재 확인
  if ! grep -q "export interface Database" lib/types/database.types.ts; then
    log_error "Database 인터페이스를 찾을 수 없습니다."
    exit 1
  fi
  
  log_success "타입 파일 검증 완료 (파일 크기: $FILE_SIZE bytes)"
}

# 함수: TypeScript 컴파일 테스트
test_typescript_compilation() {
  log_info "TypeScript 컴파일 테스트 중..."
  
  if ! command -v tsc &> /dev/null; then
    log_warning "TypeScript 컴파일러(tsc)가 설치되지 않았습니다. 컴파일 테스트를 건너뜁니다."
    return
  fi
  
  if npm run type-check &> /dev/null; then
    log_success "TypeScript 컴파일 테스트 통과"
  else
    log_warning "TypeScript 컴파일 테스트 실패. 타입 오류가 있을 수 있습니다."
  fi
}

# ============================================================================
# 메인 스크립트
# ============================================================================

echo ""
echo "============================================"
echo "  🔧 DAITJI TypeScript 타입 생성 스크립트"
echo "============================================"
echo ""

# Supabase CLI 설치 확인
check_supabase_cli

# 인자 파싱
MODE="${1:---local}"

case $MODE in
  --local)
    generate_types_local
    ;;
  --remote)
    generate_types_remote
    ;;
  *)
    log_error "잘못된 옵션: $MODE"
    echo ""
    echo "사용법: $0 [--local|--remote]"
    echo "  --local   로컬 Supabase에서 타입 생성 (기본값)"
    echo "  --remote  원격 Supabase 프로젝트에서 타입 생성"
    exit 1
    ;;
esac

# 생성된 타입 검증
validate_generated_types

# TypeScript 컴파일 테스트
test_typescript_compilation

echo ""
echo "============================================"
echo -e "${GREEN}✅ 타입 생성 완료!${NC}"
echo "============================================"
echo ""
echo "생성된 파일: lib/types/database.types.ts"
echo ""
echo "다음 단계:"
echo "  1. 타입 파일을 확인하세요: cat lib/types/database.types.ts"
echo "  2. 프론트엔드 코드에서 타입을 import하세요:"
echo "     import type { Database } from '@/lib/types/database.types'"
echo ""
