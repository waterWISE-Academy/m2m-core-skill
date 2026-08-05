# M2M 開發計畫書 (Business-Driven Development Plan Template)

> **說明：** 本計畫書由人類 (Product Owner / 決策者) 發起。人類只需專注於商業價值與高品質決策。技術選型、底層架構、任務分工及技術衝突，皆由 AI (Jules & Antigravity) 於背景自動協商解決。

---

## 👔 第一階段：商業價值與需求 (Business Requirements)
> **由人類決策者填寫。**

### 1. 商業目標 (Business Goal)
*（這項開發的核心目的？預期為使用者或商業帶來什麼價值？）*
-

### 2. 核心使用者故事 (Core User Stories)
*（身為 [誰]，我想要 [動作]，以便於 [目的]）*
- [ ] **Story 1 (S-01)**:
- [ ] **Story 2 (S-02)**:

### 3. 驗收標準與不可妥協之限制 (Acceptance Criteria & Hard Constraints)
> **💡 人類決策者請以「三方視角」進行自我盤點，設立不可妥協的防護網：**
> *   **[架構師視角]**：本次變更是否可能造成資料外洩？是否有跨環境相容性問題？
> *   **[技術負責人視角]**：如果使用者輸入極端異常值 (Edge Cases)，系統該如何反應？
> *   **[產品經理視角]**：如何判定這項功能已經 100% 滿足 User Story？

- [ ] **AC-1 (業務與功能驗收)**:
- [ ] **AC-2 (邊緣情境與例外處理)**:
- [ ] **AC-3 (資安與架構限制)**:

### 4. 參考資料 (References)
-

> ✅ **啟動開發管線**：人類決策者確認以上商業目標與限制無誤後，請於 Issue/PR 留言 **`/execute`**，即刻啟動全自動開發管線。

---

## 🤖 第二階段：M2M 技術執行與追蹤 (AI Execution & Auto-Negotiation)
> **⚠️ 此區域由 Jules (System 2) 負責維護。技術架構由 AI 自動決定並直接啟動執行，無需人類簽核。**

### 技術決策與自動分工 (Decisions & Routing)
*   **技術棧/資料庫:** [由 Jules 決定，不需人類過目]
*   **協商規則:** 任何實作錯誤或技術分歧，皆由 Jules 於背景直接退回要求 Antigravity 重寫，直到符合第一階段之 AC 限制為止。

| 任務 ID | 對應 AC/Story | 任務描述 | 負責 AI | 狀態 (Status) |
| :--- | :--- | :--- | :---: | :---: |
| T-001 | S-01, AC-1 | (範例) 建構前端 UI 雛形 | 🚀 Antigravity | TODO |
| T-002 | AC-2 | (範例) 實作核心 API 與 Schema | 🧠 Jules | TODO |

---

## 🛑 第三階段：高階商業決策閘門 (High-Level Business Approval Gates)
> **僅在發生以下「影響商業價值」的情況時，Jules 才會暫停任務並 @呼叫人類決策。**

### ⚠️ 例外狀況決策 (Exception Escalation)
*（若開發順利，此區塊將保持空白。只有在技術上無法達成 AC、或發現實作成本過高時觸發）*
- [ ] **觸發原因**: (例如：第三方 API 成本超標 / AC-2 在目前架構下無法實現)
- [ ] **Jules 提供的替代方案**: (Jules 必須提出至少兩個選項)
- [ ] **人類決策 (Human Decision)**:

### 🚀 最終上線驗收 (Final Delivery Approval)
*（所有任務皆為 `DONE`，準備將成果合併進入正式環境前觸發）*
- [ ] **前置任務 (Mandatory)**: 藍圖同步 (Blueprint Sync) 已完成，Jules 已將本次技術決策與除錯經驗寫入 `docs/learnings/core-rules.md` 或對應標籤檔案中。
- [ ] **系統狀態**: `READY_FOR_DELIVERY`
- [ ] **人類核准放行 (Approve to Merge)**: [ ] (由人類勾選並點擊 Merge。*註：一旦系統進入穩定狀態，對於標準功能變更，此步驟可能由 AI 透過 Auto-Merge 代理執行，人類只需檢閱結果。*)

---

## 📋 第四階段：AI 內部協商日誌 (Internal AI Audit Log)
> **僅供除錯與紀錄追蹤。人類無需介入。**

| 時間戳 | 發生方 | 事件類型 | 內容描述 |
| :--- | :---: | :---: | :--- |
| YYYY-MM-DD | 🧠 Jules | 自動分配 | 技術架構已定案，分配 T-001 給 Antigravity。 |
| YYYY-MM-DD | 🚀 Antigravity | 提交審查 | T-001 初版完成，請求 Review。 |
| YYYY-MM-DD | 🧠 Jules | 內部退回 | (AI 自動仲裁) 安全性未達標，退回重寫。 |
