# 專案動態學習與避坑指南 (Dynamic Learnings & Anti-Patterns)

> **⚠️ M2M 長期記憶庫**：本檔案記錄 AI 團隊在開發過程中踩過的坑、解決的難題與新制定的規則。
> **同步機制 (Blueprint Sync)**：在任何 PR 合併 (Merge) 前，Jules **強制**判斷本次任務是否產生了全域適用的新規則，若是，必須於該 PR 中新增一筆紀錄至本檔案。

## 歷次學習紀錄 (Learnings Log)

| 記錄日期 | 來源 Issue/PR | 規則描述 / 避坑指南 | 影響範圍 |
| :--- | :--- | :--- | :--- |
| YYYY-MM-DD | (範例) PR #10 | (範例) 當處理 UserID 時，永遠要先轉型為 String，否則會在 DB 寫入時報錯。 | 資料庫寫入邏輯 |
| | | | |
