# frontend/Dockerfile

# 构建阶段
FROM node:20.11.1 as build

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 创建 .env 文件（如果需要）
RUN echo "REACT_APP_API_URL=${REACT_APP_API_URL}" > .env

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine

# 复制构建产物
COPY --from=build /app/build /usr/share/nginx/html

# 复制 nginx 配置（如果需要自定义）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
