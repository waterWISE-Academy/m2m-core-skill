# 專案靜態架構藍圖 (Static Architecture Blueprint)

> **⚠️ M2M 系統核心約束**：本檔案記錄系統「不可輕易變動」的底層基底。Jules 與 Antigravity 在每次啟動任務時，**必須優先讀取此檔案**。任何與此藍圖衝突的技術決策，皆須升級至開發計畫書的「例外狀況決策」交由人類老闆授權。

## 1. 核心技術棧 (Core Tech Stack)
*   **前端**: [待專案初始化後由 Jules 填寫]
*   **後端**: [待專案初始化後由 Jules 填寫]
*   **資料庫**: [待專案初始化後由 Jules 填寫]

## 2. API 與資料交換標準 (API & Data Contracts)
*   **格式**: 所有 API 請求與回應強制使用標準 JSON 格式。
*   **錯誤處理**: 必須包含統一的錯誤代碼與友善的錯誤提示 (Error Message)。

## 3. 資安與權限邊界 (Security Boundaries)
*   **機密隔離**: 所有金鑰、密碼與敏感設定強制存放於環境變數 (`.env`) 或專屬 Secret Manager，嚴禁 hardcode 於原始碼中。
*   **Agent 隔離**: `.agentignore` 檔案必須嚴格維護，禁止 AI 代理讀取敏感客戶資料或憑證庫。
