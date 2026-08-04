# 🔄 M2M 全自動工作流與管線機制 (WorkFlow & Pipeline)

> **定位聲明**：本文件為 M2M 系統的「引擎藍圖」。詳細描繪從人類需求下達到最終程式碼上線的每一道管線齒輪如何咬合流轉。

---

## 1. 雙軌分流判定邏輯 (Dual-Track Routing)

為了保持系統上下文 (Context) 的絕對乾淨，所有任務發起時必須進行分流：

*   **軌道一：開發軌道 (修改程式碼)**
    *   **條件**：涉及系統架構變動、新增功能、修復 Bug、引入新套件等。
    *   **流程**：必須填寫 `DEVELOPMENT_PLAN_TEMPLATE.md`，並透過 Issue 的 `/execute` 指令啟動全自動 M2M 開發管線。
*   **軌道二：工作軌道 (日常無害查詢)**
    *   **條件**：技術文件查閱、API 文件解讀、單純的邏輯詢問。
    *   **流程**：開啟獨立的對話 Session。**嚴禁在此軌道內夾帶任何修改程式碼的指令**。任務結束後立即關閉對話。

---

## 2. 軌道一：全自動 M2M 管線流轉圖 (The CI Pipeline)

當人類在 Issue 留言 `/execute` 後，系統將啟動以下 4 個 Phase 的全自動管線（Zero-Touch 零接觸實作）：

### Phase A: 喚醒與解析 (Initialization)
1.  **觸發 Webhook**：GitHub Actions 監聽到 `/execute` 留言，標記 Issue 狀態為 `PLAN_READY`。
2.  **大腦記憶庫讀取**：Jules (System 2) 被喚醒。啟動時**強制優先讀取**專案根目錄的 `docs/ARCHITECTURE.md` 與 `docs/LEARNINGS_AND_RULES.md`，獲取技術邊界與歷史避坑指南。
3.  **架構產出**：Jules 解析人類的《開發計畫書》，產出技術架構，並將任務拆解，指派給 Antigravity (System 1)。

### Phase B: 實作與自我修復 (Execution & Auto-Healing)
1.  **提交草稿 PR**：Antigravity 被喚醒，建立 Branch，撰寫程式碼並發布 Pull Request。
2.  **CI 自動攔截與修復 (Auto-Healing Loop)**：
    *   PR 建立瞬間，CI 伺服器啟動自動化測試（單元測試、靜態掃描等）。
    *   **若測試失敗**：CI 腳本自動抓取 Error Logs 貼回 PR 留言，並標記 `@antigravity`。
    *   Antigravity 在背景接收 Log，分析錯誤並自動提交新的 Commit 進行修復。
    *   **此循環全程於背景執行，無需人類介入**。

### Phase C: 深度審查與收斂 (Review & Blueprint Sync)
1.  **Jules Code Review**：當 CI 亮綠燈後，Jules 進場對 Antigravity 的程式碼進行深度邏輯與資安審查。
2.  **藍圖同步 (Blueprint Sync)**：
    *   審查通過，準備合併前，Jules 強制執行盤點：**「本次開發是否產生了全域適用的新規則或學習經驗？」**
    *   若有，Jules 必須在當前 PR 中新增 Commit，將經驗寫入 `docs/LEARNINGS_AND_RULES.md`，完成長期記憶的儲存。

### Phase D: 商業放行 (Human Business Delivery)
1.  **狀態轉換**：上述流程完備後，PR 被標記為 `READY_FOR_DELIVERY`。
2.  **老闆驗收**：人類決策者進場，無須看程式碼，只需確認商業邏輯滿足，點擊 GitHub 介面的 `Merge` 按鈕，專案正式上線並進化。

---

## 3. 異常升級與降級路由 (Escalation & Downgrade Paths)

在全自動管線中，不可避免會遇到 AI 無法自行消化的死胡同。系統設有嚴格的熔斷與升級機制：

### 3.1 Deadlock (技術死鎖)
*   **觸發條件**：在 Phase B 的自動修復迴圈中，同一任務連續 **3 次** CI 測試失敗；或被 Jules 退回 (REJECTED) **3 次**。
*   **系統反應**：暫停自動化管線，標記 `[STATUS: FATAL_ERROR]`，並 `@呼叫人類決策者`。
*   **人類介入 (限縮干預)**：人類**不應親自下場寫 Code**，而是透過文字留言，引導 Jules 更換技術路線、或放寬最初設定的 AC 標準。

### 3.2 Scope Conflict (範圍衝突)
*   **觸發條件**：Jules 在 Phase A 規劃架構時，發現人類要求的驗收標準 (AC) 在現有預算或架構下無法實現；或引入了需付費的第三方 API。
*   **系統反應**：暫停執行，標記 `AWAITING_HUMAN_APPROVAL`，將替代方案（A 案/ B 案）貼在計畫書的「例外狀況決策」區塊。
*   **人類介入**：針對成本或需求進行商業妥協，給出選擇後放行。

### 3.3 Post-Merge Failure (上線後回滾機制)
*   **觸發條件**：PR 合併入 `main` 分支後，部署 CI 崩潰。
*   **系統反應**：
    *   **純程式碼變動**：系統自動觸發 `git revert` 撤銷合併，並開立最高優先級的 Bug Issue。
    *   **含資料庫變更 (Migration)**：絕對禁止自動回滾！系統將發出最高級別的 Slack/Email 警報，強制人類手動介入處理，防堵資料庫毀損。
