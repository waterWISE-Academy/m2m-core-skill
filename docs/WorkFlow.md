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
2.  **大腦記憶庫讀取 (Git-Native RAG)**：Jules (System 2) 被喚醒。啟動時**強制優先讀取** `docs/ARCHITECTURE.md` 與 `docs/learnings/core-rules.md`。同時依據 Issue 的標籤 (如 `m2m:database`) 動態載入對應領域的學習日誌，實現精確的 Context 掛載，避免記憶體溢出。
3.  **架構產出**：Jules 解析人類的《開發計畫書》，產出技術架構，並將任務拆解，指派給 Worker Agent。

### Phase B: 實作與自我修復 (Execution & Auto-Healing)
1.  **提交草稿 PR**：Antigravity 被喚醒，建立 Branch，撰寫程式碼並發布 Pull Request。
2.  **CI 自動攔截與修復 (Auto-Healing Loop)**：
    *   PR 建立瞬間，CI 伺服器啟動自動化測試（單元測試、靜態掃描等）。
    *   **若測試失敗**：CI 腳本自動抓取 Error Logs 貼回 PR 留言，並標記 `@antigravity`。
    *   Antigravity 在背景接收 Log，分析錯誤並自動提交新的 Commit 進行修復。
    *   **此循環全程於背景執行，無需人類介入**。

### Phase C: 深度審查與收斂 (Review & Blueprint Sync)
1.  **Jules Code Review**：當 CI 亮綠燈後，Jules 進場對程式碼進行深度邏輯與資安審查。
2.  **藍圖同步 (Blueprint Sync)**：
    *   審查通過，準備合併前，Jules 強制執行盤點：**「本次開發是否產生了新規則或學習經驗？」**
    *   若有，Jules 必須在當前 PR 中新增 Commit，將關鍵教訓寫入 `docs/learnings/core-rules.md` (全域) 或特定的標籤檔案中，完成結構化的長期記憶儲存。

### Phase D: 商業放行 (Human Business Delivery)
1.  **狀態轉換**：上述流程完備後，PR 被標記為 `READY_FOR_DELIVERY`。
2.  **老闆驗收**：人類決策者進場，無須看程式碼，只需確認商業邏輯滿足，點擊 GitHub 介面的 `Merge` 按鈕，專案正式上線並進化。

---

## 3. 異常升級與降級路由 (Escalation & Downgrade Paths)

在全自動管線中，不可避免會遇到各種技術死胡同。依據「絕對不讓老闆進會議室評理」的原則，系統的熔斷與自治機制如下：

### 3.1 Deadlock (技術死鎖) 與強制重構
*   **觸發條件**：在 Phase B 的自動修復迴圈中，同一任務連續 **3 次** CI 測試失敗；或被 Jules 退回 (REJECTED) **3 次**。
*   **系統反應 (AI 自治)**：
    1. 系統**不會**打擾人類老闆。
    2. Jules 強制介入，發動「架構重構 (Architectural Reset)」。
    3. Jules 必須將此失敗路線記錄至 `docs/learnings/core-rules.md` (標記為此路不通)，並產出一份全新的技術實作計畫發包給 Worker Agent。
    4. **絕對熔斷閥值**：若 Jules 的架構重構次數達到 **2 次 (architectural_reset_count)** 仍無法成功，系統將判定為「技術上無法實現」，強制轉入 **3.2 Scope Conflict** 交由老闆裁決。

### 3.2 Scope Conflict (商業/範圍衝突) - 唯一允許敲門的場景
*   **觸發條件**：Jules 在 Phase A 規劃架構，或在解決 Deadlock 時，發現人類要求的驗收標準 (AC) 在「現有預算、物理限制或基礎架構下」完全無法實現；或必須引入需高額付費的第三方 API。
*   **系統反應**：暫停執行，標記 `AWAITING_HUMAN_APPROVAL`，將替代方案（例如：降級體驗的 A 案 / 需要加錢的 B 案）貼在計畫書的「例外狀況決策」區塊。
*   **老闆決策**：這屬於商業判斷。老闆依據投資報酬率給予決策（例如：「同意降級體驗採用 A 案」）。

### 3.3 Git 衝突與上線後崩潰 (Post-Merge Failure)
*   **系統進入 MERGED 前的乾跑衝突 (Dry-Run Conflict)**：任何 PR 合併前若發生 Git 衝突，系統將退回 `CONFLICT_LOCKED`。Jules 將指示 Antigravity 進行 `git rebase` 並處理衝突，全程背景執行。
*   **上線後純程式碼崩潰**：系統自動觸發 `git revert` 撤銷合併，並在背景重啟修復管線。
*   **上線後含資料庫變更 (Migration) 的崩潰**：
    *   **系統反應 (AI 自治)**：絕對禁止自動回滾！系統將進入緊急狀態，產出最高優先級的 **Roll-forward (向前熱修復)** 任務。
    *   **資料庫降級與隔離測試 (SRE 防護)**：
        1. 系統第一時間發送指令將應用程式切換為 **唯讀模式 (Read-Only)**，暫停新資料寫入防止污染。
        2. Jules 產出修補 (Patch) PR 後，**必須在背景的 Staging 環境 (使用 Production DB 快照) 進行 Dry-run**。
        3. 若 Staging 驗證通過，執行正式修復並回報老闆。
        4. **最後底線**：若 Staging 測試失敗，系統將立刻熔斷並發送最高級別警報通知老闆，嚴禁 AI 盲目對正式資料庫進行 Hotfix 覆蓋。
