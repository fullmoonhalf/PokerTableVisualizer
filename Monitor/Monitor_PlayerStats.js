(function (ns) {
    "use strict";
    if (ns.PlayerStats) return;

    /// <summary>
    /// プレイヤー累積統計値
    /// </summary>
    function PlayerStats()
    {
        this.handCount = 0;
        this.vpipHands = 0;
        this.pfrHands = 0;
        this.threeBetHands = 0;
        this.threeBetOpportunities = 0;
    }

    /// <summary>
    /// ハンド終了時にフラグを統計に反映する（統計確定処理の入口）
    /// </summary>
    PlayerStats.prototype.commit = function(flags)
    {
        if (flags.hasVpipedThisHand)             this.vpipHands++;
        if (flags.hasPreflopRaisedThisHand)       this.pfrHands++;
        if (flags.hadThreeBetOpportunityThisHand) this.threeBetOpportunities++;
        if (flags.hasThreeBetThisHand)            this.threeBetHands++;
    }

    /// <summary>
    /// VPIP 値の取得（整数 % で四捨五入、ハンド数 0 の場合は 0）
    /// </summary>
    PlayerStats.prototype.getVpip = function()
    {
        if (this.handCount === 0) return 0;
        return Math.round(this.vpipHands * 100 / this.handCount);
    }

    /// <summary>
    /// PFR 値の取得（整数 % で四捨五入、ハンド数 0 の場合は 0）
    /// </summary>
    PlayerStats.prototype.getPfr = function()
    {
        if (this.handCount === 0) return 0;
        return Math.round(this.pfrHands * 100 / this.handCount);
    }

    /// <summary>
    /// 3bet 統計の取得
    /// </summary>
    PlayerStats.prototype.getThreeBet = function()
    {
        const opportunities = this.threeBetOpportunities;
        const attempt = this.threeBetHands;
        const rate = opportunities !== 0 ? Math.round(attempt * 100 / opportunities) : 0;
        return {
            "Opportunities": opportunities,
            "Attempt": attempt,
            "Rate": rate,
        };
    }

    /// <summary>
    /// ハンド中の判定フラグ
    /// </summary>
    function HandStatsFlags()
    {
        this.hasVpipedThisHand = false;
        this.hasPreflopRaisedThisHand = false;
        this.hadThreeBetOpportunityThisHand = false;
        this.hasThreeBetThisHand = false;
    }

    /// <summary>
    /// ファイル名用の日時文字列を生成する（YYYYMMDD_HHmmss 形式）
    /// </summary>
    function _formatDateForFilename(date)
    {
        const YYYY = date.getFullYear();
        const MM   = String(date.getMonth() + 1).padStart(2, '0');
        const DD   = String(date.getDate()).padStart(2, '0');
        const HH   = String(date.getHours()).padStart(2, '0');
        const mm   = String(date.getMinutes()).padStart(2, '0');
        const ss   = String(date.getSeconds()).padStart(2, '0');
        return `${YYYY}${MM}${DD}_${HH}${mm}${ss}`;
    }

    /// <summary>
    /// プレイヤー統計を保存用 JSON オブジェクトに変換する
    /// </summary>
    ns.exportStatsToJson = function(playerName, stats)
    {
        const now = new Date();
        const threeBet = stats.getThreeBet();
        return {
            "savedAt": now.toISOString(),
            "type": "player_stats_snapshot",
            "players": [
                {
                    "playerName": playerName,
                    "PlayerStats": {
                        "handCount":            stats.handCount,
                        "vpipHands":            stats.vpipHands,
                        "pfrHands":             stats.pfrHands,
                        "threeBetHands":        stats.threeBetHands,
                        "threeBetOpportunities":stats.threeBetOpportunities,
                        "vpipRate":             stats.getVpip(),
                        "pfrRate":              stats.getPfr(),
                        "threeBetRate":         threeBet.Rate,
                    }
                }
            ]
        };
    }

    /// <summary>
    /// JSON オブジェクトをファイルとしてダウンロードする。
    /// File System Access API (showSaveFilePicker) が利用可能な場合は
    /// 保存場所を指定できるダイアログを表示する。
    /// 利用できない環境では従来のアンカークリック方式にフォールバックする。
    /// </summary>
    ns.downloadJsonFile = async function(data, filename)
    {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });

        if (window.showSaveFilePicker)
        {
            try
            {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: "JSON",
                        accept: { "application/json": [".json"] },
                    }],
                });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            }
            catch (e)
            {
                // ユーザーがダイアログをキャンセルした場合は何もしない
                if (e.name !== "AbortError")
                {
                    console.error("[downloadJsonFile] showSaveFilePicker failed:", e);
                }
            }
        }
        else
        {
            const url = URL.createObjectURL(blob);
            const a   = document.createElement("a");
            a.href     = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    /// <summary>
    /// ファイル名に使えない文字を除去する
    /// </summary>
    function _sanitizeFilenameSegment(name)
    {
        return name.replace(/[/\\:*?"<>|]/g, "_");
    }

    /// <summary>
    /// プレイヤー統計を JSON ファイルとして保存する
    /// </summary>
    ns.saveStatsAsJsonFile = function(playerName, stats)
    {
        const data          = ns.exportStatsToJson(playerName, stats);
        const dateStr       = _formatDateForFilename(new Date());
        const safeName      = _sanitizeFilenameSegment(playerName);
        const filename      = `player_stats_${safeName}_${dateStr}.json`;
        ns.downloadJsonFile(data, filename);
    }

    ns.PlayerStats = PlayerStats;
    ns.HandStatsFlags = HandStatsFlags;
})(Monitor = Monitor || {});
