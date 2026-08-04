# M2M Core Skill: Jules x Antigravity 雙 AI 自主對接中央技能庫 (v2.3)

本專案為多代理協作（Multi-Agent System）中央技能庫，**定義並規劃了** M2M Agentic Protocol v2.3 協議規格。提供嚴謹的閉環狀態機、並發鎖定、分級人類安全閘門、資安防護與可追責稽核軌跡。

> ⚠️ **安全警告 (Security Warning)**：
> 目前的 `.github/workflows/m2m-protocol.yml` 雖具備完整的 Job 架構且能順利掛載，但其內部檢核邏輯為**「全綠燈橡皮圖章 (Rubber Stamp)」**。它不會執行任何實質的白名單或 Secret 攔截。在核心引擎程式碼實作完成前，**切勿將其用於正式生產環境的安全防護**。

## 📋 系統架構與核心角色
本協議明確定義了雙 AI 與人類的協作分工：

* **Jules (System 2 / 總指揮與審查者)**：負責全域架構解析、結構化 YAML 計畫書產出、CI 日誌分析與安全審查。
* **Antigravity (System 1 / 實作代理)**：依據計畫書進行介面實作、樣板產出與白名單內的程式碼編寫。
* **人類核准者 (Human Approver)**：於觸發安全閘門時進行分級核准，權限依據 CODEOWNERS 規範。

## 🔄 狀態機與生命週期
系統運作遵循嚴格的狀態轉換，完整狀態機架構請參閱 State Diagram：

* **狀態清單**：支援 `PLAN_READY`、`CONFLICT_LOCKED`、`IMPLEMENTED`、`REJECTED`、`AWAITING_HUMAN_APPROVAL`、`APPROVED`、`MERGED` 與 `FATAL_ERROR`。
* **防呆與防濫用**：具備 Liveness 逾時防護、孤兒分支並發排隊鎖定、以及 Reset 次數上限（最多 2 次）。

## 🛡️ 分級人類安全閘門 (§4.3)
依據變更的風險等級，系統自動套用對應的審查與權限規則：

* **一般 (Standard)**：上線前 10 次合併期間，由 maintainer 核准。（為極大化開發效率，系統穩定度過 10 次門檻後，一般性變更將由 Jules 審查通過後自動上線，CI 全綠即合併。人類老闆僅在觸發 Elevated/Critical 條件時介入決策。）
* **高風險 (Elevated)**：命中 `.env`、`config/`、`.github/workflows/` 或新增依賴（`new_dependency`），須由指定目錄負責人審查（不得為提交者本人）。
* **關鍵 (Critical)**：偵測到資料庫 Migration 或 Secret 洩漏，須經 Tech Lead 核准。
* **單人維護條款**：支援單人開發環境下的安全覆寫與稽核軌跡記錄。

## 📊 自動化成效衡量 (Zero-Touch KPIs)
本協作框架旨在將開發流程推向「零接觸實作（Zero-Touch Execution）」。為衡量 M2M 引擎的健康度，系統將追蹤以下核心指標：
| 自動化追蹤指標 | 目標閾值 | 意義 |
|---|---|---|
| **零接觸完成率 (Zero-Touch Rate)** | > 85% | PR 完全無須人類降級使用本地 IDE 即可合併的比例。 |
| **自動修復成功率** | > 80% | Agent 接收 CI 錯誤日誌後，能自行發布更新並通過測試的比例。 |
| **降級干預次數** | < 15% | 觸發人類手動介入排除障礙的比例。 |

## 📁 專案檔案結構
* `docs/M2M_Agentic_Protocol_v2.3.md`：協議核心規格書 (底層規範)。
* `docs/COT.md`：思維鍊與核心設計哲學 (心法與戰略層)。
* `docs/WorkFlow.md`：全自動工作流與管線機制 (流轉與異常路由)。
* `docs/UserManual.md`：操作手冊與 FAQ (從 0 到 1 建置與日常操作)。
* `docs/State_Diagram.mermaid`：M2M 狀態轉換圖。
* `.github/workflows/m2m-protocol.yml`：CI/CD 驗證與閘門控制引擎 (Reusable Workflow)。
* `.github/CODEOWNERS`：分級權限與責任歸屬清單。

## 🚀 整合與掛載 (Integration)
待未來核心引擎實作完成後，業務專案的掛載方式將如下所示：
```yaml
# 示意代碼，目前尚未生效
jobs:
  call-m2m-skill:
    uses: Jaylanbee/m2m-core-skill/.github/workflows/m2m-protocol.yml@main
```
