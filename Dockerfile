# 构建阶段 (Build stage)
FROM node:20-alpine AS build-stage

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖 (配置淘宝镜像源加速)
RUN pnpm config set registry https://registry.npmmirror.com/ && pnpm install

# 复制项目所有文件
COPY . .

# 执行构建
RUN pnpm build

# 生产阶段 (Production stage)
FROM nginx:1.25-alpine

# 设置环境变量，指定默认的后端 API 地址 (在运行时可以被覆盖)
ENV API_URL=http://112.124.70.235:8080

# 复制自定义 Nginx 模板，使用 Nginx 官方镜像的 envsubst 特性在启动时替换 API_URL 变量
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# 复制构建好的静态文件到 Nginx html 目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]