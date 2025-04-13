FROM node:20

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# pnpm 설정파일 먼저 복사
COPY pnpm-lock.yaml ./
COPY package.json ./

# 의존성 설치
RUN pnpm install

# 앱 소스 복사
COPY . .

# 빌드
RUN pnpm build

# 정적 파일 서빙
RUN pnpm add -g serve
CMD ["serve", "-s", "build"]