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
    /// プレイヤー統計を保存用 JSON オブジェクトに変換する
    /// </summary>
    ns.exportStatsToJson = function(playerName, stats, handRange)
    {
        const now = new Date();
        const threeBet = stats.getThreeBet();
        const handRangeStats = (handRange && handRange.Stats && typeof handRange.Stats === "object")
            ? JSON.parse(JSON.stringify(handRange.Stats))
            : {};
        return {
            "savedAt": now.toISOString(),
            "format": {
                "type": "player_stats_snapshot",
                "version": 2,
            },
            "playerName": playerName,
            "PlayerStats": {
                "handCount":             stats.handCount,
                "vpipHands":             stats.vpipHands,
                "pfrHands":              stats.pfrHands,
                "threeBetHands":         stats.threeBetHands,
                "threeBetOpportunities": stats.threeBetOpportunities,
                "vpipRate":              stats.getVpip(),
                "pfrRate":               stats.getPfr(),
                "threeBetRate":          threeBet.Rate,
            },
            "HandRange": handRangeStats,
        };
    }

    function _isValidHandRangeStats(handRange)
    {
        if (!handRange || typeof handRange !== "object") return false;
        for (const key in handRange)
        {
            if (!Object.prototype.hasOwnProperty.call(handRange, key)) continue;
            if (!/^\d+_\d+$/.test(key)) return false;

            const stat = handRange[key];
            if (!stat || typeof stat !== "object") return false;
            if (typeof stat.count !== "number" || stat.count < 0) return false;
            if (typeof stat.sum !== "number" || stat.sum < 0) return false;
        }
        return true;
    }

    /// <summary>
    /// プレイヤー統計 JSON のバリデーション
    /// </summary>
    ns.validatePlayerStatsJson = function(json)
    {
        if (!json || typeof json !== "object") return false;
        if (typeof json.playerName !== "string") return false;
        if (!json.PlayerStats || typeof json.PlayerStats !== "object") return false;
        const s = json.PlayerStats;
        if (typeof s.handCount !== "number" || s.handCount < 0) return false;
        if (typeof s.vpipHands !== "number" || s.vpipHands < 0) return false;
        if (typeof s.pfrHands !== "number" || s.pfrHands < 0) return false;
        if (typeof s.threeBetHands !== "number" || s.threeBetHands < 0) return false;
        if (typeof s.threeBetOpportunities !== "number" || s.threeBetOpportunities < 0) return false;
        if (json.HandRange !== undefined && !_isValidHandRangeStats(json.HandRange)) return false;
        return true;
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
    /// プレイヤー統計を JSON ファイルとして保存する
    /// </summary>
    ns.saveStatsAsJsonFile = function(playerName, stats, handRange)
    {
        const data     = ns.exportStatsToJson(playerName, stats, handRange);
        const dateStr  = HtmlUtil.formatDateForFilename(new Date());
        const safeName = HtmlUtil.sanitizeFilenameSegment(playerName);
        const filename = `player_stats_${safeName}_${dateStr}.json`;
        ns.downloadJsonFile(data, filename);
    }

    ns.PlayerStats = PlayerStats;
    ns.HandStatsFlags = HandStatsFlags;
})(Monitor = Monitor || {});
