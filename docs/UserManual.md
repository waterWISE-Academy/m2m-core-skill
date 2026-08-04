# 📖 M2M 操作手冊與 FAQ (User Manual & Setup Guide)

> **定位聲明**：本文件為系統的「安裝說明書與日常指南」。將鉅細靡遺地引導您從 0 到 1 建立 M2M 架構，並說明決策者（Product Owner）的日常操作 SOP。

---

## 1. 🚀 從 0 到 1：系統基礎建設與連線設定 (Setup Guide)

M2M 採用 Hub-and-Spoke (中央作業系統與終端 APP) 架構。

### Phase 1: 中央大腦設定 (The Hub)
這是您所有專案的基礎設施核心。
1.  **建立核心庫**：建立您自己的 `m2m-core-skill` 儲存庫。強烈建議將此儲存庫設為 **Private (私有)** 以保護您的商業機密與自動化引擎。
2.  **【關鍵】設定私有庫的 Action 存取權限**：
    *若您的 `m2m-core-skill` 是 Private 狀態，GitHub 預設會阻擋其他專案呼叫它。您必須手動開啟權限：*
    *   進入 `m2m-core-skill` 儲存庫網頁，點擊 `Settings`。
    *   在左側選單點擊 `Actions` -> `General`。
    *   捲動到頁面**最底端**，找到 **`Access`** 區塊。（注意：此區塊只有在專案為 Private 時才會出現）。
    *   選擇 **`Accessible from repositories owned by '您的帳號'`** (個人帳號) 或 **`Accessible from repositories in the '您的組織'`** (組織帳號)。
    *   點擊 `Save` 保存。這樣您未來的子專案才能順利取得「通關金牌」呼叫中央引擎。
3.  **身分配置 (Agent Identity)**：為 Jules 與 Antigravity 建立專屬的 GitHub 機器人帳號（或封裝為 GitHub App），賦予 Repository 的讀寫權限。
4.  **環境變數設定**：在儲存庫的 Secrets 中設定 `ORG_GITHUB_TOKEN` 等必要憑證。
    *(⚠️ **注意：嚴禁使用 GitHub Actions 預設的 `GITHUB_TOKEN`**。預設 Token 發送的留言不會觸發後續的 Workflow，這會導致 M2M 引擎發生靜默斷鏈。您必須為主動執行的 Agent 申請一組專屬的 Personal Access Token (PAT) 或 GitHub App Token 來填入此欄位。)*

### Phase 2: 子專案掛載 (The Spoke)
未來您開啟任何新專案（如電商網站、ERP 系統），只需執行以下 3 步即可連線至大腦：
1.  建立一個全新的空白 GitHub 專案。
2.  在專案中建立檔案 `.github/workflows/enable-m2m.yml`，寫入指向中央引擎的指令（詳見 README 的 `Future Integration` 區塊）。
3.  將 `DEVELOPMENT_PLAN_TEMPLATE.md` 複製至該新專案的 `templates/` 目錄中。
這樣就完成了！您的新專案已具備 M2M 全自動代工廠的防護與執行力。

---

## 2. 📝 老闆的日常：發起與管理任務

身為決策者，您的唯一工作就是寫好「開發計畫書」。

### 2.1 填寫計畫書與三方視角檢核
開啟 Issue，貼上 `DEVELOPMENT_PLAN_TEMPLATE.md`，並專注於填寫「商業目標」、「使用者故事 (User Story)」與「驗收標準 (AC)」。
**請強迫自己使用以下「三方視角」撰寫 AC：**
*   **[架構師視角]**：例如 *「AC-3: 必須確認 .env 中存放第三方 API Key，嚴禁寫死在程式碼中。」*
*   **[技術負責人視角]**：例如 *「AC-2: 如果第三方 API 斷線，畫面上必須顯示『系統維護中』，不能讓整個頁明白屏。」*
*   **[產品經理視角]**：例如 *「AC-1: 登入按鈕必須放在右上角，且點擊後 1 秒內要有載入動畫。」*

### 2.2 啟動指令：`/execute`
填寫完畢後，在 Issue 的留言區（Comment）打上：
`/execute`
按下送出。系統即刻接管，您只需泡杯咖啡，等待 PR 的誕生。

---

## 3. 🛑 決策者的最終防線：審批指南

您不需要看程式碼，但遇到以下兩種情況，系統會暫停並通知您（@您的帳號）：

### 3.1 遇到「例外狀況決策 (Exception Escalation)」
如果 Jules 發現目前的架構做不到您的要求，或者需要花費高額 API 成本，會在計畫書留下選項。
*   **您的動作**：閱讀 Jules 提出的 A 案與 B 案，在下方留言您的商業決策（例如：*「考量成本，同意退而求其次採用 B 案，請繼續執行」*）。

### 3.2 專案單人維護條款 (Solo-Maintainer Clause) 的授權
如果您是這間公司的唯一老闆兼維護者。依據 M2M 協議，遇到「更改資料庫」或「引入重大套件」等高風險變更時，系統理應封鎖「提交者自己核准自己」。
*   **您的動作**：為了合法覆寫此安全限制，您必須在計畫書的「例外狀況決策」區塊留下這段文字紀錄：*「已知此變更涉及資料庫重構/高風險變更，確認放行。」* 以留下明確的稽核軌跡。

---

## 4. ❓ 常見問答與故障排除 (FAQ)

**Q1: 我可以直接開 Cursor 或 Cline 幫忙改一點點 Code 嗎？**
> **絕對禁止。** 這是 M2M 的天條。在本地端使用 AI IDE 會破壞專案的「上下文潔癖」，造成不可逆的邏輯污染，並且讓該次除錯經驗無法寫入「全域藍圖 (Blueprint)」中。所有修改必須透過 Issue 發包給 GitHub 上的背景 Agent。
> **緊急事件例外 (Emergency Override)**：若遇到凌晨產線大當機等極端危急狀況，允許人類工程師破壞 M2M 協議直接使用 IDE 搶修。但事後**必須**強制發起一個 `Post-Mortem` 任務，由 Jules 將本次手動修改的邏輯，事後補登記回 `LEARNINGS_AND_RULES.md` 藍圖中，以維持系統記憶。

**Q2: 如果 CI 一直紅燈，Antigravity 好像卡在無限迴圈，我該怎麼介入？**
> 系統內建了防 Deadlock 機制。如果連續 3 次 CI 失敗，系統會自動切斷迴圈並通知您。
> 此時，您**不要去改 Code**。請直接在 Issue 留言，給予大方向指導（例如：*「目前的套件可能有相容性問題，請 Jules 考慮更換使用 XXX 套件重寫。」*），讓 Agent 重新開始。

**Q3: 為什麼 PR 上的 Code 明明寫對了，但 Jules 還不准我 Merge？**
> 請檢查是否卡在「藍圖同步 (Blueprint Sync)」階段。Jules 必須將本次任務的新規則寫入 `docs/LEARNINGS_AND_RULES.md`，這個過程可能會多花 1~2 分鐘。請耐心等待系統標記出 `READY_FOR_DELIVERY` 再點擊 Merge。

**Q4: 我只是想問 AI 一個技術名詞的意思，也要填開發計畫書嗎？**
> 不需要。請遵守「雙軌分流」機制。開啟一個純粹的聊天視窗（軌道二）進行詢問即可，但千萬不要在那個視窗裡叫 AI 幫你寫 Code 或發 PR。
