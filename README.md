# Coffee Shop E-commerce Platform

## 專案簡介

本專案為前後端分離的咖啡豆電商平台，整合藍新金流（含 Apple Pay）、社群互動，協助小型商家拓展線上銷售與品牌曝光，讓更多小店可以被看見！

## 測試網站

https://coffee-e-commerce.zeabur.app/

## 測試帳號

- 一般會員：  
  帳號：testcustomer@gmail.com  
  密碼：testcustomer

- 商家會員：  
  帳號：teststore@gmail.com  
  密碼：teststore

- 目前發現的測試問題：

  Q：在電腦上使用 Google Pay 會顯示授權成功並成功導回 return，但點選查看訂單後發現顯示未付款？
  A： 藍新測試規範為「Google Pay 請使用真實之信用卡號，至 Android 裝置上進行綁定與支付測試」使用電腦可能會影響測試結果。
  接收到的問題為 notify 解密不正確，但有鑒於使用 WebATM 與 Apple Pay 沒有異常，判斷應該不會是解密過程有誤，這部分尚待聯繫客服處理。

## 核心功能

### 1. 會員系統

- 會員註冊、登入、登出
- 整合 Google OAuth 第三方登入
- JWT 認證與授權機制
- 忘記密碼/重設密碼流程
- 會員資料管理編輯

### 2. 商品管理

- 商家商品 CRUD 操作
- 圖片上傳與管理
- 商品搜索與篩選功能
- 商品詳情展示

### 3. 購物車系統

- 即時更新購物車狀態
- 商品數量管理
- 購物車持久化存儲
- 訂單建立、查詢、付款狀態追蹤
- 藍新金流 API 串接

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

   - 前端導入 Redux Toolkit 狀態管理優化
   - 導入 TypeScript，提升型別安全與維護性
   - 實現 CI/CD 流程 (目前使用 Zeabur)
   - Docker
   - 單元測試, E2e

2. **功能擴展**

   - 添加商品評價系統
   - 訂單狀態推播通知（Email/站內訊息）
   - 商家後台數據分析（銷售報表、流量統計）
   - 與杯測師合作 => 杯測師怎麼說？ 專業評測、推薦、專欄
   - 收藏/追蹤功能（商品、商家、文章）

3. **性能優化**

   - 前端 SSR、SSG，效能優化，提升首屏速度與 SEO (Next.js)
   - 優化數據庫查詢 (索引、聚合)
   - Redis/Memcached 熱資料快取
   - API 請求優化與防抖，減少重複請求、提升用戶體驗

## 部署說明

測試網站：https://coffee-e-commerce.zeabur.app/

### 本地部署：

```bash
   git clone https://github.com/ter55128/Coffee-E-commerce.git
   cd Coffee-E-commerce
```

###（使用 Concurrently）

```bash
# 在根目錄安裝 concurrently
npm install concurrently --save-dev

# 一鍵安裝前後端依賴
npm run install-all
```

#### 配置環境變數：

- 在 backend 下創建 `.env` 文件，並添加以下內容：

```bash
MONGO_URI=mongodb://localhost:27017/my-project
PASSWORD_SECRET=your_password_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
```

- 在 frontend 下創建 `.env` 文件，並添加以下內容：

```bash
  REACT_APP_API_URL=http://localhost:8080
```

```bash
# 一鍵啟動前後端服務
npm run dev
```

### 注意事項

- 確保 `.env` 文件分別存在於 backend & frontend 目錄中
- 後端服務需要在 port 8080 運行
- 前端開發服務器需要在 port 3000 運行
- 上傳文件會存儲在 backend/uploads 目錄

## 聯繫方式

如有任何問題，請聯繫 [linkuanhan8811@gmail.com](mailto:linkuanhan8811@gmail.com)。
