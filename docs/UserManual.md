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
4.  **環境變數設定 (門禁卡與大腦燃料)**：在儲存庫的 Secrets (Settings -> Secrets and variables -> Actions) 中，您必須設定以下兩類必要憑證：
    *   **門禁卡 (`ORG_GITHUB_TOKEN`)**：授權 Agent 跨專案留言、發 PR 的權限。
        *(⚠️ **注意：嚴禁使用 GitHub Actions 預設的 `GITHUB_TOKEN`**。預設 Token 發送的留言不會觸發後續的 Workflow，這會導致 M2M 引擎發生靜默斷鏈。您必須為主動執行的 Agent 申請一組專屬的 Personal Access Token (PAT) 填入此欄位。)*
    *   **大腦燃料 (LLM API Key)**：授權 Agent 呼叫外部 AI 模型的思考能力。您必須至少提供一把金鑰，例如 **`OPENAI_API_KEY`** 或 **`ANTHROPIC_API_KEY`**，系統才能在背景驅動 Worker Agent 寫出程式碼。

### Phase 2: 建立 Spoke 範本專案 (Template Packaging)
為了讓未來的專案能「一秒開箱即用」，建議您建立一個名為 `m2m-spoke-template` 的 Repository，並在設定中勾選 **`Template repository`**。
請在此範本專案中放入以下基礎設施：
1.  **呼叫器 (`.github/workflows/m2m-caller.yml`)**：寫入指向中央引擎的指令。**強烈建議：** 呼叫路徑請綁定特定版號（如 `@v2.3`）而非 `@main`，避免總部改版導致產線中斷。
2.  **計畫書範本 (`templates/DEVELOPMENT_PLAN_TEMPLATE.md`)**：放入商業驅動開發計畫書。
3.  **基礎目錄 (`db/migrations/` 與 `docs/learnings/`)**：預留給資料庫變更與藍圖同步使用。
4.  **基礎衛生檔案 (`.gitignore`)**：請務必加入標準的 `.gitignore` 檔案，防止 AI 在本地開發時意外上傳 `.env` 或系統暫存檔，造成資安破口。

### Phase 3: 子專案掛載與防護鎖 (The Spoke)
未來您只需使用上述的 `m2m-spoke-template` 點擊 **"Use this template"** 即可開啟新專案。
⚠️ **【極度重要：手動上鎖】** GitHub Template **不會**複製分支保護規則。新專案建立後，您**必須**手動前往 `Settings` -> `Branches`，為 `main` 分支加上以下保護：
*   ✅ **Require status checks to pass before merging** (強制 CI 通過才能合併)
*   ✅ **Do not allow bypassing the above settings** (禁止強推)

完成上鎖後，您的新專案就正式具備了 M2M 全自動代工廠的絕對防護力！

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
*   **您的動作**：為了合法覆寫此安全限制，您必須以**您的真實 GitHub 帳號**在 Issue/PR 留言進行明確授權。系統的 CI 閘門具備防偽造機制 (Auth Spoofing Prevention)，會嚴格比對留言者的 `github.actor`，AI 絕對無法靠捏造字串騙過閘門。

---

## 4. ❓ 常見問答與故障排除 (FAQ)

**Q1: 我可以直接開 Cursor 或 Cline 幫忙改一點點 Code 嗎？**
> **絕對禁止。** 這是 M2M 的天條。在本地端使用 AI IDE 會破壞專案的「上下文潔癖」，造成不可逆的邏輯污染，並且讓該次除錯經驗無法寫入「全域藍圖 (Blueprint)」中。所有修改必須透過 Issue 發包給 GitHub 上的背景 Agent。
> **緊急事件例外 (Emergency Override)**：若遇到凌晨產線大當機等極端危急狀況，允許人類工程師破壞 M2M 協議直接使用 IDE 搶修。但事後**必須**強制發起一個 `Post-Mortem` 任務，由 Jules 將本次手動修改的邏輯，事後補登記回 `docs/learnings/core-rules.md` 藍圖中，以維持系統記憶。

**Q2: 如果 CI 一直紅燈，Antigravity 好像卡在無限迴圈，我該怎麼介入？**
> **您完全不需要介入。** 系統內建了防 Deadlock 機制。如果連續 3 次 CI 失敗，系統會自動觸發「架構重構 (Architectural Reset)」。Jules 會在背景自行吸收錯誤教訓、切換技術路線並重新發包。您唯一會被通知的時刻，只有當 Jules 評估「目前的預算或物理限制根本無法達成您的需求 (Scope Conflict)」時，才會請您做商業裁決。

**Q3: 為什麼 PR 上的 Code 明明寫對了，但 Jules 還不准我 Merge？**
> 請檢查是否卡在「藍圖同步 (Blueprint Sync)」階段。Jules 必須將本次任務的新規則寫入 `docs/learnings/` 目錄中，這個過程可能會多花 1~2 分鐘。請耐心等待系統標記出 `READY_FOR_DELIVERY` 再點擊 Merge。

**Q4: 我只是想問 AI 一個技術名詞的意思，也要填開發計畫書嗎？**
> 不需要。請遵守「雙軌分流」機制。開啟一個純粹的聊天視窗（軌道二）進行詢問即可，但千萬不要在那個視窗裡叫 AI 幫你寫 Code 或發 PR。

**Q5: GitHub Token (`ORG_GITHUB_TOKEN`) 跟 LLM API Key (如 `OPENAI_API_KEY`) 有什麼不同？只設定一個可以嗎？**
> **不行，兩者缺一不可。**
> *   **GitHub Token 是「門禁卡」**：它讓系統有權限去您的專案裡建立分支、留言、發起 Pull Request (控制「手腳」)。
> *   **LLM API Key 是「大腦燃料」**：Agent 本身只是空殼腳本，當它需要讀懂計畫書、寫出程式碼時，必須連線到 OpenAI 或 Anthropic (控制「大腦思考」)。
> 如果只給門禁卡沒給燃料，AI 可以發留言，但寫不出任何 Code；如果只給燃料沒給門禁卡，AI 會因為無權操作專案而直接報錯。

**Q6: 除了 OpenAI 或 Anthropic，我可以換成「開源模型」來幫我寫 Code 嗎？要怎麼設定？**
> **完全可以，M2M 系統支援模型解耦 (Model Decoupling)。**
> 推薦使用最強的開源寫碼模型如 **Meta Llama 3.1 (405B/70B)** 或 **DeepSeek Coder V2**。
> 您不需要自己架設伺服器，只需向以下第三方託管平台註冊並取得 API Key，接著設定到 GitHub Secrets 即可切換大腦：
> *   **Groq 平台 (主打極速 Llama 3)**：註冊 `console.groq.com`，建議變數名稱設為 `GROQ_API_KEY`。
> *   **Together AI (支援各種開源模型)**：註冊 `api.together.ai`，建議變數名稱設為 `TOGETHER_API_KEY`。
> *   **DeepSeek 官方 (性價比極高)**：註冊 `platform.deepseek.com`，建議變數名稱設為 `DEEPSEEK_API_KEY`。

**Q7: 上述提到的 API 方案 (無論開源或閉源) 有每日限額嗎？需要額外費用嗎？超量時系統會怎麼處理？**
> **計費方式與限額**：所有由第三方平台提供的 LLM API（包含 OpenAI、Anthropic，以及上述託管開源模型的 Groq、Together AI 等）皆採用 **Pay-as-you-go (按 Token 使用量計費)** 模式。
> *多數平台新註冊時會提供微量的「免費額度 (Free Tier)」供測試，但有嚴格的 Rate Limit (例如每分鐘請求次數上限)。當超過免費額度或頻率限制時，您必須在該平台上綁定信用卡進行儲值才能繼續使用。*
>
> **超量防護機制 (Dynamic Routing Fallback)**：
> M2M 協定內建了「自動故障轉移」機制。若您在 GitHub Secrets 中同時設定了多把鑰匙（例如同時有 `ANTHROPIC_API_KEY` 與 `OPENAI_API_KEY`）：
> 當系統的首選模型（如 Claude）因為「帳戶沒錢」或「觸發每日限額 (Rate Limit Error)」而罷工時，系統**不會崩潰**，而是會在背景自動攔截錯誤，並將剩餘的任務瞬間路由 (Route) 交給第二順位的模型（如 GPT-4o）接手完成，確保您的全自動產線永不中斷。

**Q8: 開源模型和閉源模型 (如 GPT-4o, Claude) 開發效果一樣嗎？我該怎麼選擇？**
> **在 80% 的常規任務中，效果一樣且開源更具優勢。但在 20% 的極端複雜情境中，仍需閉源模型輔助。**
>
> *   **80% 的日常開發 (推薦開源)**：例如常規功能開發、寫測試案例、修復明確的 Bug。頂級開源模型 (如 DeepSeek Coder V2 或 Llama 3.1 405B) 不僅能達到與閉源模型相同的品質，而且速度更快、API 成本極低。
> *   **20% 的極端情境 (需閉源備援)**：例如超大型跨檔案重構，或使用了極度冷門的新框架。這時開源模型較容易發生「邏輯斷層」或「幻覺」。Claude 3.5 Sonnet 在這種高難度邏輯推演上依然保有最高的天花板。
>
> **💡 M2M 終極路由策略 (Optimized Routing Strategy)：**
> 為了達成「極速、低成本、高穩定、不中斷」的最佳平衡，M2M 建議您採用以下四階層的自動調度與容錯機制：
>
> 🚀 **優先級 1：日常開發主力 (The 80% Workhorse)**
> *   **指派給**：DeepSeek (核心寫碼) + Groq (微型重構/狀態回報)
> *   **優化執行**：在拋給 LPU 推論極速的 Groq 之前，系統會掛載**「字數攔截器」**，確認 Token 數低於其嚴格的免費層 TPM 限額再發送，避免觸發 429 錯誤。
>
> 🛡️ **優先級 2：複雜架構與大量閱讀 (雙軌制 The Heavy Lifters)**
> *   **2-A 常規大批量萃取**：指派給 **Gemini 3.6 Flash**。利用其 15 RPM 的高頻率與 1,500 RPD 的日限額，處理大量的程式碼閱讀與基礎重構。
> *   **2-B 極端複雜度全局重構**：指派給 **Gemini 2.5 Pro**。注意其免費層限額極度嚴苛，因此本機端必須實作**「速率限制器 (Rate Limiter)」**，強制將系統對 Pro 的請求頻率鎖死在**每分鐘最多 2 次**，以確保不會因超限而阻斷連線。
>
> 🚑 **優先級 3：自動故障轉移兜底 (Dynamic Fallback)**
> *   **指派給**：GitHub Models (GPT-4o / Claude) 等免費聚合平台。
> *   **調度邏輯**：做為所有節點（如 DeepSeek 連續 503 Service Unavailable，或 Gemini 額度耗盡）失效時的終極保險，提供「絕對防禦」與不中斷兜底。
