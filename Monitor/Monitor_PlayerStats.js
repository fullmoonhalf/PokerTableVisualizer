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

    ns.PlayerStats = PlayerStats;
    ns.HandStatsFlags = HandStatsFlags;
})(Monitor = Monitor || {});
