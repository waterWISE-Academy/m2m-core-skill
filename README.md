# M2M Core Skill: Jules x Antigravity 雙 AI 自主對接中央技能庫 (v2.3)

本專案為多代理協作（Multi-Agent System）中央技能庫，實作了 M2M Agentic Protocol v2.3 協議，提供嚴謹的閉環狀態機、並發鎖定、分級人類安全閘門、資安防護與可追責稽核軌跡。

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

* **一般 (Standard)**：上線前 10 次合併期間，由 maintainer 核准。
* **高風險 (Elevated)**：命中 `.env`、`config/`、`.github/workflows/` 或新增依賴（`new_dependency`），須由指定目錄負責人審查（不得為提交者本人）。
* **關鍵 (Critical)**：偵測到資料庫 Migration 或 Secret 洩漏，須經 Tech Lead 核准。
* **單人維護條款**：支援單人開發環境下的安全覆寫與稽核軌跡記錄。

## 📁 專案檔案結構
* `docs/M2M_Agentic_Protocol_v2.3.md`：協議核心規格書。
* `docs/State_Diagram.mermaid`：M2M 狀態轉換圖。
* `.github/workflows/m2m-protocol.yml`：CI/CD 驗證與閘門控制引擎。
* `.github/CODEOWNERS`：分級權限與責任歸屬清單。

## 🚀 如何在業務專案中掛載
在您的實際業務專案中建立 `.github/workflows/enable-m2m.yml`，引用本中央技能庫的引擎：

```yaml
name: Enable M2M AI Protocol

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issue_comment:
    types: [created]

jobs:
  call-m2m-skill:
    uses: Jaylanbee/m2m-core-skill/.github/workflows/m2m-protocol.yml@main
    secrets:
      ORG_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
