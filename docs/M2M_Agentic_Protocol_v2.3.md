# 🤖 M2M Agentic Protocol: Jules x Antigravity 雙 AI 自主對接執行協議書 (v2.3 完整生產版)
### *(Machine-to-Machine Autonomous Handshake Protocol with Robust State Machine, Human Gateways & Accountability)*

> **使用說明**：本協議針對 v2.1 的審查意見進行最終補強，解決了核准權限分級、並發鎖定恢復路徑、Schema 欄位一致性、人類閘門逾時升級、稽核軌跡核准者身分記錄，以及依賴變更風險分級等生產環境收尾問題。

---

## 📋 文件元數據

| 項目 | 內容 |
|---|---|
| **協議版本** | M2M v2.3 (完整生產版) |
| **通訊模式** | 結構化標籤 (GitHub Labels / YAML Front-matter) 驅動的閉環狀態機 |
| **安全基底** | 分級人類核准閘門、供應鏈與憑證掃描、並發鎖定與恢復、逾時升級、完整可追責稽核軌跡 |

---

## 一、 角色定義與系統定位

### 角色 A：Jules (非同步總指揮與審查者 / System 2)
*   **職責**：全域架構解析、結構化 YAML 計畫書產出、CI 日誌分析、Code Review 與安全漏洞審查。
*   **執行環境**：雲端非同步虛擬機。

### 角色 B：Antigravity (極速實作代理 / System 1)
*   **職責**：依據結構化計畫書進行介面實作、樣板產出、依賴限縮在白名單內的程式碼編寫。
*   **執行環境**：本地/雲端互動 IDE 執行環境。

### 角色 C：人類核准者 (Human Approver)
*   **職責**：於人類安全閘門觸發時進行分級核准、處理逾時升級通知、擁有最終合併否決權。
*   **權限來源**：由 `CODEOWNERS` 檔案或專案設定的核准者名單定義（詳見 4.3）。

---

## 二、 觸發機制與基礎設施安全 (Webhook & Concurrency)

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

## 三、 結構化計畫書 Schema (含版本協商與歸零紀錄)

Jules 產出的實作藍圖必須採用以下 YAML 格式。若 `m2m_protocol_version` 與系統支援版本不匹配，CI 將直接拒絕解析並報錯：

```yaml
m2m_protocol_version: "2.3"
task_id: "ISSUE-104"
target_branch: "feature/issue-104"
contains_db_migration: false        # 影響自動回滾策略
dependency_change_risk: "none"      # none | patch_bump | new_dependency（見 4.2）
allowed_file_paths:
  - "src/components/Button.tsx"
  - "tests/Button.test.tsx"
data_contracts:
  - name: "ButtonProps"
    schema: "interface ButtonProps { label: string; onClick: () => void; }"
edge_cases_to_test:
  - "Empty string label handling"

# 以下欄位僅在 rejection_count 歸零重置時填寫
reset_history:
  - reset_at: null        # ISO 8601 時間戳，由系統自動填入
    reset_reason: null    # 必填：Jules 說明為何需求變更導致重新規劃
```

---

## 四、 雙 AI 通訊狀態機與演算法規範

### 4.1 計數防濫用與 Liveness 逾時
*   **REJECTED 歸零防濫用機制**：計數器（`rejection_count`）與歸零次數上限（`reset_count`，上限為 2）嚴格綁定 PR ID。每次歸零時，系統將 `reset_reason` 與時間戳寫入 Schema 的 `reset_history` 陣列（見第三節），不可事後修改。若累計歸零次數超過 2 次，系統強制封鎖並進入 `[STATUS: FATAL_ERROR]`。
*   **Liveness 逾時機制 (Timeout)**：`PLAN_READY` 超過 4 小時或 `IMPLEMENTED` 超過 2 小時未響應，觸發 `[STATUS: FATAL_ERROR]`。
*   **並發排隊逾時**：`CONFLICT_LOCKED` 狀態排隊超過 8 小時未輪到執行，觸發 `[STATUS: FATAL_ERROR]`。

### 4.2 檔案越界防護與 Secret Scanning
*   **檔案白名單比對**：CI 自動比對 `git diff --name-only` 與 `allowed_file_paths`，越界即拒絕。
*   **強制憑證掃描 (Secret Scanning)**：CI 內建 `gitleaks` 或 `truffleHog` 掃描器。不論檔案路徑為何，只要偵測到疑似 API Key、密碼或憑證字串，一律強制攔截進人類閘門。
*   **依賴變更風險分級 (Dependency Risk Tiering)**：為避免所有依賴變更都無差別進入人類閘門造成「閘門疲勞」，依變更性質分級處理，由 CI 自動判讀並回填 `dependency_change_risk`：
    *   `patch_bump`：既有依賴的 patch/minor 版本號更新，且無新增套件 → 僅記錄於稽核軌跡，**不**強制進人類閘門。
    *   `new_dependency`：新增任何未曾出現於 lockfile 的套件 → 強制進人類閘門，視為供應鏈風險。
    *   `none`：無依賴檔案變更。

### 4.3 分級人類安全閘門與回傳路徑 (Tiered Human-in-the-Loop Gate)

當觸發以下任一情境時，系統強制切換為 `[STATUS: AWAITING_HUMAN_APPROVAL]`，並依風險等級指定核准權限：

| 風險等級 | 觸發條件 | 核准權限要求 |
|---|---|---|
| **一般 (Standard)** | 專案上線前 10 次合併期間的一般性變更 | 任一 `CODEOWNERS` 名單中的 maintainer 即可核准 |
| **高風險 (Elevated)** | 命中 `.env`、`config/`、CI/CD 腳本（`.github/workflows/`）、`new_dependency` | 須為 `CODEOWNERS` 名單中對應目錄的指定負責人，且不得為該 PR 的提交者本人 |
| **關鍵 (Critical)** | CI 偵測到疑似洩漏憑證、或 `contains_db_migration: true` | 須經 `CODEOWNERS` 中至少一名 Tech Lead 層級核准，且不得為提交者本人 |

*   **人類閘門回傳路由**：
    *   **核准**：核准者在 PR 介面點擊 `Approve` 審查或留言 `/approve`。系統驗證留言者是否具備該風險等級所需權限，通過後標記 `[STATUS: APPROVED]`，自動恢復管線進入合併程序；若權限不足，系統拒絕該次核准並在稽核軌跡記錄無效嘗試。
    *   **拒絕**：核准者點擊 `Request Changes` 或留言 `/reject [原因]`，系統標記 `[STATUS: CHANGES_REQUESTED]`，帶入原因退回 Antigravity 重寫。
    *   **關閉**：人類直接關閉 PR，任務終止。
*   **逾時升級 (Escalation Timeout)**：若 `AWAITING_HUMAN_APPROVAL` 狀態持續超過 **24 小時** 無任何核准/拒絕動作，系統自動 @ 提及對應風險等級的核准者群組（一般 → 專案 maintainer 頻道；高風險/關鍵 → 直接通知 Tech Lead）發送升級提醒。若再持續 **72 小時** 無回應，標記 `stale-approval` 並將任務暫緩，等待人工排程。

---

## 五、 異常處理、自動回滾與稽核軌跡

### 5.1 失敗降級與智慧回滾 (Smart Rollback)
*   **連續三次拒絕**：累積滿 3 次 `REJECTED`，鎖定為 `[STATUS: FATAL_ERROR]`。
*   **合併後崩潰與 Migration 排除**：若 Main 分支合併後 CI 失敗：
    *   **條件 A (含 Migration)**：若 YAML 中 `contains_db_migration: true`，**絕對禁止自動 revert**，系統立即發送即時通知（Slack/Email）並標記 `critical-migration-failure`，強制交由人類工程師手動介入處理。
    *   **條件 B (純程式碼)**：自動觸發 `git revert` 退回上一版，發送通知，並建立標記為 `critical-bug` 的 Issue 交由 Jules 重新分析。

### 5.2 稽核軌跡 (Audit Trail)
所有事件自動封存於 `docs/audit_trails/{task_id}.log`，須包含但不限於：
*   所有狀態切換的時間戳與觸發來源（AI 系統事件 or 人類手動操作）。
*   Jules 的結構化計畫書（含每一版本的 diff）。
*   `reset_history` 中的歸零原因與時間。
*   每次 `REJECTED` 的精確錯誤日誌。
*   **人類閘門核准/拒絕紀錄，必須包含核准者身分識別（帳號 ID）、時間戳、風險等級、以及核准/拒絕的具體留言內容**；任何權限不足被拒絕的核准嘗試亦須留存記錄。
*   逾時升級通知的發送對象與時間。
