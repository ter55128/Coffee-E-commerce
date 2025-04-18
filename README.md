# Coffee Shop E-commerce Platform

## 專案簡介

一個整合電商與社群功能的咖啡豆購物平台，提供商家上架商品、會員購物及文章分享功能。

## 專案展示

## 核心功能

### 1. 會員系統

- 支持一般會員與商家會員角色區分－
- 整合 Google OAuth 第三方登入
- JWT 認證與授權機制
- 會員資料管理與密碼重置功能

### 2. 商品管理

- 商家商品 CRUD 操作
- 圖片上傳與管理
- 商品搜索與篩選功能
- 商品詳情展示

### 3. 購物車系統

- 即時更新購物車狀態
- 商品數量管理
- 購物車持久化存儲

### 4. 文章社群

- 會員文章發布與管理
- 文章評論互動功能
- 文章搜索與分類

## 技術棧

### 前端

- **框架**: React 18
- **狀態管理**: Context API
- **路由**: React Router v6
- **HTTP 客戶端**: Axios
- **樣式**: CSS Modules
- **響應式設計**: 支持多種設備尺寸

### 後端

- **運行環境**: Node.js
- **框架**: Express
- **數據庫**: MongoDB
- **ODM**: Mongoose
- **認證**: JWT, Passport.js
- **文件上傳**: Multer

## 未來優化方向

1. **技術升級**

   - 導入 TypeScript
   - 實現 CI/CD 流程
   - Docker
   - 單元測試, E2e

2. **功能擴展**

   - 串接金流 API
   - 添加商品評價系統
   - 與杯測師合作 => 杯測師怎麼說？

3. **性能優化**

   - 圖片懶加載
   - 實現服務端渲染
   - 優化數據庫查詢
   - 緩存

## 部署說明

### clone 專案到本地：

```bash
   git clone https://github.com/ter55128/coffee-platform.git
   cd Coffee-Platform
```

### 快速部署（使用 Concurrently）

```bash
# 在根目錄安裝 concurrently
npm install concurrently --save-dev

# 一鍵安裝前後端依賴
npm run install-all

# 一鍵啟動前後端服務
npm run dev
```

### 配置環境變數：

- 在 backend 下創建 `.env` 文件，並添加以下內容：

```bash
MONGO_URI=mongodb://localhost:27017/my-project
PASSWORD_SECRET=your_password_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

```bash
   nodemon server.js

```

### 目錄結構

coffee-shop/
├── frontend/ # React 前端應用 (Port 3000)
├── backend/ # Node.js 後端 API (Port 8080)
│ ├── .env # 後端環境變數配置
│ └── uploads/ # 檔案上傳目錄

### 注意事項

- 確保 `.env` 文件存在於 backend 目錄中
- 後端服務需要在 port 8080 運行
- 前端開發服務器需要在 port 3000 運行
- 上傳文件會存儲在 backend/uploads 目錄

## 聯繫方式

如有任何問題，請聯繫 [linkuanhan8811@gmail.com](mailto:linkuanhan8811@gmail.com)。
