# frontend/Dockerfile

# 構建階段
FROM node:20.11.1 as build

WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install --legacy-peer-deps

# 複製源代碼
COPY . .

# 構建時使用 REACT_APP_API_URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 構建應用
RUN npm run build

# 生產階段
FROM nginx:alpine

# 複製構建產物
COPY --from=build /app/build /usr/share/nginx/html

# 創建 nginx 配置模板
COPY nginx.conf /etc/nginx/templates/default.conf.template

# 設置 nginx 可用的環境變量
ENV API_URL=${REACT_APP_API_URL}

# 暴露端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
