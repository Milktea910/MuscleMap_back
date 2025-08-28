# MuscleMap 後端 API

一個全功能的健身追蹤應用程式後端 API，提供用戶管理、健身計劃、運動資料庫、InBody 數據追蹤和文章管理等功能。

## 📋 目錄

- [技術架構](#-技術架構)
- [功能特色](#-功能特色)
- [安裝指南](#-安裝指南)
- [環境變數設定](#-環境變數設定)
- [API 端點](#-api-端點)
- [資料庫結構](#-資料庫結構)
- [開發指南](#-開發指南)
- [部署](#-部署)

## 🛠 技術架構

### 後端技術
- **Node.js** - JavaScript 執行環境
- **Express.js** - Web 應用程式框架
- **MongoDB** - NoSQL 資料庫
- **Mongoose** - MongoDB ODM

### 身份驗證與安全
- **Passport.js** - 身份驗證中介軟體
- **JWT (jsonwebtoken)** - 無狀態身份驗證
- **bcrypt** - 密碼雜湊加密

### 檔案處理
- **Multer** - 檔案上傳處理
- **Cloudinary** - 雲端媒體管理

### 開發工具
- **Nodemon** - 自動重啟開發伺服器
- **ESLint** - 程式碼品質檢查
- **Prettier** - 程式碼格式化

## ✨ 功能特色

### 🔐 用戶系統
- 用戶註冊與登入
- JWT 身份驗證與授權
- 個人資料管理
- 密碼加密與安全存儲
- 角色權限控制（用戶/管理員）

### 💪 健身計劃管理
- 創建個人化健身課表
- 一週七天詳細訓練規劃
- 課表公開分享機制
- 按讚與收藏功能
- 課表推薦系統

### 🏃 運動資料庫
- 豐富的運動動作資料庫
- 運動影片與說明
- 難度分級系統
- 目標肌群分類
- 器材類別管理

### 📊 身體數據追蹤
- InBody 數據記錄
- 體重、肌肉量、體脂追蹤
- 歷史數據圖表分析
- 個人化數據儀表板

### 📰 內容管理
- 健身文章發布
- 精選內容管理
- 文章分類與排序
- 內容 SEO 優化

## 🚀 安裝指南

### 系統需求
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm 或 yarn

### 安裝步驟

1. **複製專案**
```bash
git clone https://github.com/Milktea910/MuscleMap_back.git
cd MuscleMap_back
```

2. **安裝依賴**
```bash
npm install
```

3. **設定環境變數**
```bash
cp .env.example .env
# 編輯 .env 檔案，填入必要的環境變數
```

4. **啟動開發伺服器**
```bash
npm run dev
```

伺服器將在 `http://localhost:4000` 上運行

## 🔧 環境變數設定

在專案根目錄創建 `.env` 檔案：

```env
# 資料庫連線
DB_URL=mongodb://localhost:27017/musclemap

# JWT 密鑰
JWT_SECRET=your_super_secret_key_here

# 伺服器埠號
PORT=4000

# Cloudinary 設定（用於檔案上傳）
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🌐 API 端點

### 用戶管理 (`/user`)

| 方法 | 端點 | 描述 | 權限 |
|------|------|------|------|
| POST | `/user` | 用戶註冊 | 公開 |
| POST | `/user/login` | 用戶登入 | 公開 |
| GET | `/user/profile` | 獲取個人資料 | 需要認證 |
| PATCH | `/user/profile` | 更新個人資料 | 需要認證 |
| PATCH | `/user/refresh` | 刷新 JWT | 需要認證 |
| DELETE | `/user/logout` | 用戶登出 | 需要認證 |
| PATCH | `/user/favorite` | 添加收藏課表 | 需要認證 |
| GET | `/user/favorite` | 獲取收藏列表 | 需要認證 |

### 健身課表 (`/routine`)

| 方法 | 端點 | 描述 | 權限 |
|------|------|------|------|
| POST | `/routine` | 創建課表 | 需要認證 |
| GET | `/routine/public` | 獲取公開課表 | 公開 |
| GET | `/routine/my` | 獲取我的課表 | 需要認證 |
| GET | `/routine/liked` | 獲取按讚課表 | 需要認證 |
| PATCH | `/:id` | 更新課表 | 需要認證 |
| DELETE | `/:id` | 刪除課表 | 需要認證 |
| POST | `/:id/like` | 切換按讚狀態 | 需要認證 |
| PATCH | `/:id/visibility` | 更新公開狀態 | 需要認證 |

### 運動資料庫 (`/exercise`)

| 方法 | 端點 | 描述 | 權限 |
|------|------|------|------|
| GET | `/exercise` | 獲取所有運動 | 公開 |
| GET | `/:id` | 獲取單個運動 | 公開 |
| POST | `/exercise` | 創建運動 | 管理員 |
| PATCH | `/:id` | 更新運動 | 管理員 |
| DELETE | `/:id` | 刪除運動 | 管理員 |

### InBody 數據 (`/inbody`)

| 方法 | 端點 | 描述 | 權限 |
|------|------|------|------|
| POST | `/inbody` | 創建數據記錄 | 需要認證 |
| GET | `/inbody` | 獲取所有記錄 | 需要認證 |
| GET | `/inbody/profile` | 獲取最新記錄 | 需要認證 |
| GET | `/:id` | 獲取單筆記錄 | 需要認證 |
| PUT | `/:id` | 更新記錄 | 需要認證 |
| DELETE | `/:id` | 刪除記錄 | 需要認證 |

### 文章管理 (`/article`)

| 方法 | 端點 | 描述 | 權限 |
|------|------|------|------|
| GET | `/article/featured` | 獲取精選文章 | 公開 |
| GET | `/article` | 獲取所有文章 | 公開 |
| GET | `/:id` | 獲取單篇文章 | 公開 |
| POST | `/article` | 創建文章 | 管理員 |
| PATCH | `/:id` | 更新文章 | 管理員 |
| DELETE | `/:id` | 刪除文章 | 管理員 |

## 🗄 資料庫結構

### User (用戶)
```javascript
{
  account: String,          // 帳號
  username: String,         // 使用者名稱
  email: String,           // 電子郵件
  password: String,        // 加密密碼
  gender: String,          // 性別
  role: String,            // 角色 (user/admin)
  favorites: Array,        // 收藏課表
  tokens: Array           // JWT tokens
}
```

### Routine (健身課表)
```javascript
{
  user: ObjectId,          // 用戶 ID
  title: String,           // 課表標題
  content: String,         // 課表描述
  weeklyPlan: Array,       // 一週訓練計劃
  workouts: Array,         // 運動列表（舊版相容）
  isPublic: Boolean,       // 是否公開
  likes: Array,            // 按讚用戶
  likesCount: Number       // 按讚數量
}
```

### Exercise (運動)
```javascript
{
  name: String,            // 運動名稱
  equipment: String,       // 器材類型
  difficulty: String,      // 難度等級
  targetMuscle: Array,     // 目標肌群
  video: String,           // 教學影片
  notes: Array            // 注意事項
}
```

### InBody (身體數據)
```javascript
{
  user: ObjectId,          // 用戶 ID
  weight: Number,          // 體重
  muscleMass: Number,      // 肌肉量
  fat: Number,             // 體脂量
  bmi: Number,             // BMI
  recordDate: Date         // 記錄日期
}
```

### Article (文章)
```javascript
{
  title: String,           // 文章標題
  description: String,     // 文章描述
  author: String,          // 作者
  image: String,           // 文章圖片
  link: String,            // 外部連結
  buttonText: String,      // 按鈕文字
  isFeatured: Boolean,     // 是否精選
  isActive: Boolean,       // 是否啟用
  order: Number           // 排序
}
```

## 👨‍💻 開發指南

### 專案結構
```
MuscleMap_back/
├── controllers/         # 控制器邏輯
│   ├── user.js
│   ├── routine.js
│   ├── exercise.js
│   ├── inbody.js
│   └── article.js
├── models/             # 資料模型
│   ├── user.js
│   ├── routine.js
│   ├── exercise.js
│   ├── inbody.js
│   └── article.js
├── routes/             # 路由定義
│   ├── user.js
│   ├── routine.js
│   ├── exercise.js
│   ├── inbody.js
│   └── article.js
├── middlewares/        # 中介軟體
│   ├── auth.js         # 身份驗證
│   └── upload.js       # 檔案上傳
├── index.js           # 應用程式入口
├── passport.js        # Passport 設定
└── package.json       # 專案設定
```

### 開發指令
```bash
# 開發模式（自動重啟）
npm run dev

# 程式碼檢查
npx eslint .

# 程式碼格式化
npx prettier --write .
```

### API 回應格式

#### 成功回應
```json
{
  "success": true,
  "message": "操作成功",
  "data": {...}
}
```

#### 錯誤回應
```json
{
  "success": false,
  "message": "錯誤訊息"
}
```

### 身份驗證

使用 JWT Bearer Token：
```
Authorization: Bearer <your_jwt_token>
```

## 🚀 部署

### 環境準備
1. 準備 MongoDB 資料庫（MongoDB Atlas 推薦）
2. 設定 Cloudinary 帳號
3. 準備 Node.js hosting 服務

### 部署步驟
1. 設定生產環境變數
2. 構建並上傳程式碼
3. 安裝依賴：`npm install --production`
4. 啟動應用：`node index.js`

### 建議的環境
- **Heroku**
- **Railway**
- **Render**
- **AWS EC2**
- **Google Cloud Platform**

## 📝 授權

本專案採用 ISC 授權條款。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個專案！

## 📞 聯絡資訊

如有任何問題，請聯絡開發團隊或在 GitHub 上開啟 Issue。

---

由 MuscleMap 開發團隊用 ❤️ 製作
