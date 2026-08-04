# 🤖 M2M Agentic Protocol: Jules x Antigravity 雙 AI 自主對接執行協議書 (v2.3 完整生產版)
### *(Machine-to-Machine Autonomous Handshake Protocol with Robust State Machine, Human Gateways & Accountability)*

> **使用說明**：本文件為 M2M 系統的底層規格與約束。請務必搭配 `COT.md` (設計哲學)、`WorkFlow.md` (管線流轉) 以及 `UserManual.md` (操作手冊) 一併閱讀，以確保全域架構的認知一致性。

---

## 📋 文件元數據

| 項目 | 內容 |
|---|---|
| **協議版本** | M2M v2.3 (完整生產版) |
| **通訊模式** | 結構化標籤 (GitHub Labels / YAML Front-matter) 驅動的閉環狀態機 |
| **安全基底** | 分級人類核准閘門、供應鏈與憑證掃描、並發鎖定與恢復、逾時升級、完整可追責稽核軌跡 |

---

## 一、 角色定義與系統定位 (System 1/2 Architecture)

### 角色 A：Jules (架構師與審查者 / 系統二：慢想)
*   **特質**：擅長邏輯分析、深思熟慮。
*   **職責**：接收並解析《開發計畫書》、強制讀取藍圖 (Blueprint)、制定全域技術架構、拆解任務分配給 Antigravity、處理複雜演算法、進行深度的 Code Review、執行藍圖同步 (Blueprint Sync)。
*   **執行環境**：完全受控的 GitHub/GitLab 雲端非同步虛擬機。

### 角色 B：Antigravity (先鋒與生成者 / 系統一：快思)
*   **特質**：擅長直覺反應、高速產出。
*   **職責**：接收 Jules 的指令，快速建立程式碼骨架 (Scaffolding)、產出 UI 雛形、撰寫樣板程式碼 (Boilerplate)、根據 CI 錯誤日誌自動修復。
*   **執行環境**：完全受控的 GitHub/GitLab 雲端非同步虛擬機。

### 角色 C：人類 / 產品負責人 (Human / Product Owner)
*   **職責**：負責定義產品的「計畫目標」、「功能需求」與「預期效益」。不涉及技術細節實作。僅在關鍵商業決策點（如成本超標、需求妥協、最終上線驗收）進行拍板定案。
*   **協作入口**：透過填寫 `templates/DEVELOPMENT_PLAN_TEMPLATE.md` 啟動整個 M2M 開發流程。

> ⛔ **絕對禁止條款 (No Local AI IDEs)**：為防止 AI 上下文污染 (Context Pollution) 與逃避稽核軌跡，**嚴禁在本地端使用 AI IDE (如 Cursor, Cline) 進行程式碼編寫與除錯**。所有開發任務強制於版本控制系統 (VCS) 的全自動管線中進行。

---

## 二、 雙軌分流與零接觸對接機制 (Dual-Track & Zero-Touch Handoff)

### 2.1 雙軌分流機制 (Dual-Track Routing)
*   **軌道一：開發軌道 (修改程式碼)**：必須填寫 `DEVELOPMENT_PLAN_TEMPLATE.md`，並嚴格遵循下方 2.2 的全自動 M2M 管線。
*   **軌道二：工作軌道 (不改程式碼)**：僅限於日常詢問、架構探討或文件查閱。開啟獨立的對話 Session，**嚴禁在此軌道內夾帶修改程式碼的指令**，以確保 Context 輕量純粹。

### 2.2 軌道一：全自動對接與實作流程 (Auto-Execution Pipeline)
1.  **計畫書啟動**：人類將業務需求與限制（並運用三方視角自我檢核）填入 `DEVELOPMENT_PLAN_TEMPLATE.md`，並在 Issue/PR 留言 **`/execute`** 啟動全自動管線。
2.  **大腦記憶庫讀取**：Jules 啟動後，**強制優先讀取**專案藍圖 (`docs/ARCHITECTURE.md` 與 `docs/LEARNINGS_AND_RULES.md`)，作為技術規劃的邊界。
3.  **Jules 分析分工 (System 2)**：Jules 產出技術架構，將任務分派給 Antigravity。
4.  **Antigravity 執行 (System 1)**：根據分配的任務產出初步程式碼 (Draft PR) 或修改。
5.  **自動驗證與修復 (Auto-Healing Loop)**：PR 提交後，CI 伺服器自動運行測試。若測試失敗，CI 將錯誤日誌直接貼回 PR。Agent 接收錯誤日誌後自動於背景進行除錯與更新，**此循環完全無需人類介入**。若連續 3 次失敗 (Deadlock)，Jules 接手重新評估架構。
6.  **藍圖同步 (Blueprint Sync)**：自動修復與 Code Review 皆通過後，準備進行 Merge 前，**Jules 必須自我盤點**：若本次任務產生了全域適用的新規則或避坑經驗，Jules 必須在當前 PR 中新增一個 Commit，將其寫入 `docs/LEARNINGS_AND_RULES.md`。
7.  **人類最終放行**：藍圖同步完成後，系統標記為 `READY_FOR_DELIVERY`。老闆確認無誤後點擊 Merge，完成專案進化。

---

## 三、 觸發機制與基礎設施安全 (Webhook & Concurrency)

*   **觸發機制與身份驗證**：透過 **GitHub Webhook / GitLab Events** 事件驅動。所有入站 Webhook 請求必須驗證簽章（Signature Verification），並透過全局事件 ID（Event ID）進行去重（Idempotency Check），防止重複事件觸發任務。
*   **並發鎖定與恢復 (Concurrency Lock & Recovery)**：
    *   Jules 計畫書中 `allowed_file_paths` 宣告的檔案路徑，在 CI 層進行全域排他鎖定。
    *   若其他進行中的 Task 嘗試修改重疊檔案，系統自動阻斷並標記 `[STATUS: CONFLICT_LOCKED]`。
    *   **恢復路徑**：被鎖定的 Task 自動進入等待佇列（FIFO），系統訂閱佔用鎖定的 Task 的終態事件（`MERGED` / `FATAL_ERROR` / 人類關閉 PR）。鎖定資源釋放後，系統自動對排隊中的 Task 重新觸發 `PLAN_READY` 事件。若排隊等待超過 **8 小時**，自動升級為 `[STATUS: FATAL_ERROR]` 並通知人類，禁止無限期排隊。
*   **通訊狀態標籤 (Structured Labels)**：狀態切換必須寫在 PR 或 Issue 的 **YAML Front-matter 第一行**，並同步對應至 VCS 的官方 **Labels**：
    *   `[STATUS: PLAN_READY]`
    *   `[STATUS: IMPLEMENTED]`
    *   `[STATUS: REJECTED]`
    *   `[STATUS: CONFLICT_LOCKED]`（新增：並發鎖定中，等待排隊恢復）
    *   `[STATUS: AWAITING_HUMAN_APPROVAL]`
    *   `[STATUS: APPROVED]`（人類閘門放行）
    *   `[STATUS: CHANGES_REQUESTED]`（人類閘門退回）
    *   `[STATUS: MERGED]`
    *   `[STATUS: FATAL_ERROR]`

---

## 四、 結構化系統執行 Schema (含版本協商與歸零紀錄)

Jules 產出的實作藍圖必須採用以下 YAML 格式。若 `m2m_protocol_version` 與系統支援版本不匹配，CI 將直接拒絕解析並報錯：

```yaml
m2m_protocol_version: "2.3"
task_id: "ISSUE-104"
associated_ac_ids: ["AC-1", "AC-2"] # 必須追溯至開發計畫書的驗收標準
target_branch: "feature/issue-104"
contains_db_migration: false        # 影響自動回滾策略
dependency_change_risk: "none"      # none | patch_bump | major_bump | new_dependency（見 5.2）
allowed_file_paths:
  - "src/components/Button.tsx"
  - "tests/Button.test.tsx"
data_contracts:
  - name: "ButtonProps"
    schema: "interface ButtonProps { label: string; onClick: () => void; }"
edge_cases_to_test:
  - "Empty string label handling"

# 初始化時應為空陣列。僅在 rejection_count 歸零重置時，系統才會 append 新紀錄
reset_history: []
```

---

## 五、 雙 AI 通訊狀態機與演算法規範

### 5.1 計數防濫用與 Liveness 逾時
*   **REJECTED 歸零防濫用機制**：計數器（`rejection_count`）與歸零次數上限（`reset_count`，上限為 2）嚴格綁定 PR ID。每次歸零時，系統將 `reset_reason` 與時間戳寫入 Schema 的 `reset_history` 陣列（見第三節），不可事後修改。若累計歸零次數超過 2 次，系統強制封鎖並進入 `[STATUS: FATAL_ERROR]`。
*   **Liveness 逾時機制 (Timeout)**：`PLAN_READY` 超過 4 小時或 `IMPLEMENTED` 超過 2 小時未響應，觸發 `[STATUS: FATAL_ERROR]`。
*   **並發排隊逾時**：`CONFLICT_LOCKED` 狀態排隊超過 8 小時未輪到執行，觸發 `[STATUS: FATAL_ERROR]`。

### 5.2 檔案越界防護與 Secret Scanning
*   **檔案白名單比對**：CI 自動比對 `git diff --name-only` 與 `allowed_file_paths`，越界即拒絕。
*   **強制憑證掃描 (Secret Scanning)**：CI 內建 `gitleaks` 或 `truffleHog` 掃描器。不論檔案路徑為何，只要偵測到疑似 API Key、密碼或憑證字串，一律強制攔截進人類閘門。
*   **依賴變更風險分級 (Dependency Risk Tiering)**：為避免所有依賴變更都無差別進入人類閘門造成「閘門疲勞」，依變更性質分級處理，由 CI 自動判讀並回填 `dependency_change_risk`：
    *   `patch_bump`：既有依賴的 patch/minor 版本號更新，且無新增套件 → 僅記錄於稽核軌跡，**不**強制進人類閘門。
    *   `major_bump`：既有依賴的大版號 (Major Version) 更新 → 強制進人類閘門，視為高破壞性風險。
    *   `new_dependency`：新增任何未曾出現於 lockfile 的套件 → 強制進人類閘門，視為供應鏈風險。
    *   `none`：無依賴檔案變更。

### 5.3 分級人類安全閘門與回傳路徑 (Tiered Human-in-the-Loop Gate)

當觸發以下任一情境時，系統強制切換為 `[STATUS: AWAITING_HUMAN_APPROVAL]`，並依風險等級指定核准權限：

| 風險等級 | 觸發條件 | 核准權限要求 |
|---|---|---|
| **一般 (Standard)** | 專案上線前 10 次合併期間的一般性變更 | 任一 `CODEOWNERS` 名單中的 maintainer 即可核准 |
| **高風險 (Elevated)** | 命中 `.env`、`config/`、CI/CD 腳本（`.github/workflows/`）、`new_dependency` 或 `major_bump` | 須為 `CODEOWNERS` 名單中對應目錄的指定負責人，且不得為該 PR 的提交者本人 |
| **關鍵 (Critical)** | CI 偵測到疑似洩漏憑證、或 `contains_db_migration: true` | 須經 `CODEOWNERS` 中至少一名 Tech Lead 層級核准，且不得為提交者本人 |

*   **單人維護條款 (Solo-Maintainer Clause)**：若專案為單一擁有者（如個人專案），允許繞過 Elevated 與 Critical 層級「不得為提交者本人」的限制。**但強制要求**人類在放行前，必須於開發計畫書中的「例外狀況決策」區塊留下明確的商業授權文字紀錄，以落實「老闆必須知情風險並親自授權」的原則。

*   **人類閘門回傳路由**：
    *   **核准**：核准者在 PR 介面點擊 `Approve` 審查或留言 `/approve`。系統驗證留言者是否具備該風險等級所需權限，通過後標記 `[STATUS: APPROVED]`，自動恢復管線進入合併程序；若權限不足，系統拒絕該次核准並在稽核軌跡記錄無效嘗試。
    *   **拒絕 (人類決策)**：核准者點擊 `Request Changes` 或留言 `/reject [原因]`，系統標記 `[STATUS: CHANGES_REQUESTED]`，帶入原因退回 AI 團隊重新評估。
    *   **關閉**：人類直接關閉 PR，任務終止。
*   **逾時升級 (Escalation Timeout)**：若 `AWAITING_HUMAN_APPROVAL` 狀態持續超過 **24 小時** 無任何核准/拒絕動作，系統自動 @ 提及對應風險等級的核准者群組發送升級提醒。若**累積等待時間達 96 小時**（首次提醒後再過 72hr），標記為 `STALE_APPROVAL` 並暫緩排程。若持續閒置達 **7 天**，自動標記為 `ABANDONED` 廢棄任務，釋放資源。

### 5.4 AI 內部仲裁與 CI 自動修復 (Auto-Negotiation & Auto-Healing)
為落實零接觸實作，AI 必須具備從錯誤中自我恢復的能力：
*   **CI 自動攔截與修復**：PR 提交後，若 CI 單元測試或靜態分析失敗，CI 腳本自動將錯誤日誌貼回 PR 並附加標籤。Agent 偵測後自動於背景讀取日誌並修正，此過程無需人類介入。
*   **Jules 仲裁路由**：Jules 對 Antigravity 的產出擁有最終審查權。當 Jules 手動退回產出 (REJECTED) 時：
    *   **局部修正 (REJECTED -> IMPLEMENTED)**：單純邏輯瑕疵或安全漏洞，由 Antigravity 針對當前 PR 直接修正。
    *   **重新規劃 (REJECTED -> PLAN_READY)**：技術路線、套件選型不可行時，Jules 必須歸零重啟，並寫入 `reset_history`。
*   **人類降級干預 (Human Intervention) 的限縮**：由於全面禁止本地 AI IDE，當發生連續 3 次 CI 失敗的 Deadlock 時，系統將暫停並發送通知。此時人類介入**僅限於**：重新檢視/放寬 AC 標準，或引導 Jules 更換技術路線（透過純文字留言），不建議人類親自下場寫 Code。

---

## 六、 異常處理、自動回滾與稽核軌跡

### 6.1 失敗降級與智慧回滾 (Smart Rollback)
*   **連續三次拒絕**：累積滿 3 次 `REJECTED`，鎖定為 `[STATUS: FATAL_ERROR]`，代表 AI 發生 Deadlock。
*   **合併後崩潰與 Migration 排除**：若 Main 分支合併後 CI 失敗：
    *   **條件 A (含 Migration)**：若 YAML 中 `contains_db_migration: true`，**絕對禁止自動 revert**，系統立即發送即時通知（Slack/Email）並標記 `critical-migration-failure`，強制交由人類手動介入處理。
    *   **條件 B (純程式碼)**：自動觸發 `git revert` 退回上一版，發送通知，並建立標記為 `critical-bug` 的 Issue 交由 Jules 重新分析。**若 `git revert` 本身發生衝突失敗**，則標記該 Issue 為 `critical-bug-manual-intervention` 並升級通知人類，停止自動化修復。

### 6.2 稽核軌跡 (Audit Trail)
所有事件自動封存於 `docs/audit_trails/{task_id}.log`，須包含但不限於：
*   所有狀態切換的時間戳與觸發來源（AI 系統事件 or 人類手動操作）。
*   Jules 的結構化計畫書（含每一版本的 diff）。
*   `reset_history` 中的歸零原因與時間。
*   每次 `REJECTED` 的精確錯誤日誌。
*   **人類閘門核准/拒絕紀錄，必須包含核准者身分識別（帳號 ID）、時間戳、風險等級、以及核准/拒絕的具體留言內容**；任何權限不足被拒絕的核准嘗試亦須留存記錄。
*   逾時升級通知的發送對象與時間。
