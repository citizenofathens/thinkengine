FROM node:20

# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# lock파일 & deps 설치
COPY pnpm-lock.yaml package.json ./
RUN pnpm install

# 소스 복사 & 빌드
COPY . .
RUN pnpm build

# static build 폴더는 .svelte-kit/output/static이 아님! adapter-static 사용 시 `build/`로 설정됨
# serve로 정적 호스팅
CMD ["npx", "serve", "-s", "build"]
