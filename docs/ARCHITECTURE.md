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
# 🏛️ M2M 全域架構與介面契約規範 (Global Architecture & Interface Contracts)

> **定位聲明**：本文件定義了 M2M 中央指揮中心 (Hub) 與終端業務專案 (Spoke) 之間的強制性技術約定。所有掛載 M2M 協議的終端專案，必須遵守以下架構規範，否則 CI 閘門將無法正常運作。

## 1. 目錄結構強制規範 (Mandatory Directory Structure)

為了讓機器 (CI 腳本) 能夠精準識別變更風險並啟動對應防護，所有 Spoke 專案必須遵守以下路徑約定：

*   **資料庫變更目錄**：`db/migrations/`
    *   **規定**：所有涉及資料庫 Schema 變動的腳本，必須且只能存放在此目錄下。
    *   **CI 效益**：CI 腳本將監聽此路徑 (`git diff --name-only | grep "^db/migrations/"`)。一旦觸發，將強制啟用「Staging 快照測試」與「上線崩潰熔斷」最高防護機制。
*   **學習日誌目錄**：`docs/learnings/`
    *   **規定**：取代單一肥大檔案，經驗日誌需拆分存放。其中 `docs/learnings/core-rules.md` 為全域必讀檔案。
    *   **CI 效益**：落實 Git-Native 的情境檢索 (RAG)，避免 AI 記憶體溢出。

## 2. 系統介面契約 (System Interface Contracts)

為確保中央 CI 能夠在發生災難時接管終端應用程式，所有 Spoke 專案必須實作以下標準介面：

### 2.1 緊急唯讀降級介面 (Emergency Read-Only Degradation)
當資料庫測試或部署發生崩潰時，系統必須能立刻暫停新資料寫入。
*   **實作要求**：Spoke 專案必須提供一種讓 GitHub Actions 能從外部觸發的「唯讀模式」切換機制。
*   **建議方式**：
    1.  提供一組受 Secret 保護的 Webhook API 供 CI 呼叫。
    2.  或在基礎設施層（如 Kubernetes 或 PaaS 平台）提供一鍵切換環境變數 `APP_MODE=READ_ONLY` 的 CLI 腳本。

### 2.2 Staging 快照演習介面 (Staging Snapshot Dry-run)
針對高風險的資料庫變更，嚴禁盲目寫入 Production。
*   **實作要求**：Spoke 專案的 CI/CD 配置中，必須準備一個獨立的 `staging` 環境。
*   **流程約定**：該環境在執行熱修復 (Hotfix) 測試前，必須能自動拉取 Production 的最新快照 (Snapshot) 進行還原，確保 Dry-run 的測試環境與真實世界 100% 一致。
