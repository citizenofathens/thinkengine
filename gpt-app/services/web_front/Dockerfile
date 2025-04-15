# 1. 베이스 이미지 선택
FROM node:20

# 2. npm을 사용하여 pnpm 전역 설치
RUN npm install -g pnpm@8

# 3. 작업 디렉토리 설정
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc* ./

# 5. onlyBuiltDependencies 설정 명시적 지정 (false 또는 true 시도)
RUN pnpm config set only-built-dependencies false
# 설정이 제대로 적용되었는지 확인 (선택 사항)
RUN pnpm config get only-built-dependencies

# 6. 의존성 설치 (lockfile 고정)
RUN pnpm install
# 6. 나머지 소스 코드 복사
COPY . .

# 7. 애플리케이션 빌드
RUN pnpm build

# 8. 애플리케이션 실행 포트 노출
EXPOSE 5000

# 9. 애플리케이션 실행 명령어
CMD ["pnpm", "start"]