FROM node:22.14.0

WORKDIR /app

# 複製 package.json 和 .npmrc
COPY package*.json .npmrc ./

# 安裝依賴
RUN npm install --legacy-peer-deps

# 複製源代碼
COPY . .

# 創建上傳目錄
RUN mkdir -p public/uploads/beans

# 設置環境變數
ENV NODE_ENV=production

# 暴露端口
EXPOSE 8080

# 啟動命令
CMD ["npm", "start"]
