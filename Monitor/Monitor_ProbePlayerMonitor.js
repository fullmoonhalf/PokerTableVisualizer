(function (ns) {
    "use strict";
    if(ns.cProbePlayerMonitor) return;

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbePlayerMonitor(argRootNode)
    {
        this.HtmlRoot = argRootNode;

        this.DragableRoot = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_DRAGABLE_ROOT);
        this.DragableObject = new HtmlUtil.cDragableElement(this.DragableRoot);

        this.LayoutRoot = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_LAYOUT_ROOT);
        this.NameValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_NAME_VALUE, "");
        this.WinrateValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_WINRATE_VALUE, "");
        this.ActionValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_ACTION_VALUE, "");
        this.PositionValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_POSITION_VALUE, "");
        this.HolecardValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_HOLECARD_VALUE);
        this.NormalGroup = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_GROUP_NORMAL);
        this.StatsGroup = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_GROUP_STATS);
        this.VpipValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_STATS_VPIP_VALUE, "");
        this.PfrValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_STATS_PFR_VALUE, "");
        this.ThreeBetValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_STATS_3BET_VALUE, "");
        this.HandCountValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_STATS_HANDCOUNT_VALUE, "");
        this.HandRangeCanvas = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_STATS_HANDRANGE_CANVAS);
        this.SpeechStatus = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_SPEECH_STATUS, "");
    }
    cProbePlayerMonitor.prototype = Object.create(ns.cHtmlBase.prototype);
    cProbePlayerMonitor.prototype.constructor = cProbePlayerMonitor;

    /// <summary>
    /// プレイヤーアクションの表示
    /// </summary>
    cProbePlayerMonitor.prototype.showPlayerAction = function(argPlayerAction, argAggressiveLabel)
    {
        switch (argPlayerAction) {
            case PokerConst.PlayerAction.None:
        		this.LayoutRoot.classList.toggle("fold", false);
        		this.LayoutRoot.classList.toggle("allin", false);
        		this.LayoutRoot.classList.toggle("aggressive", false);
                this.ActionValue.innerHTML = "";
                break;
            case PokerConst.PlayerAction.Check:
        		this.LayoutRoot.classList.toggle("fold", false);
        		this.LayoutRoot.classList.toggle("allin", false);
        		this.LayoutRoot.classList.toggle("aggressive", false);
                this.ActionValue.innerHTML = "Check";
                break;
            case PokerConst.PlayerAction.Bet:
        		this.LayoutRoot.classList.toggle("fold", false);
        		this.LayoutRoot.classList.toggle("allin", false);
        		this.LayoutRoot.classList.toggle("aggressive", true);
                this.ActionValue.innerHTML = argAggressiveLabel || "Bet";
                break;
            case PokerConst.PlayerAction.Call:
        		this.LayoutRoot.classList.toggle("fold", false);
        		this.LayoutRoot.classList.toggle("allin", false);
        		this.LayoutRoot.classList.toggle("aggressive", false);
                this.ActionValue.innerHTML = "Call";
                break;
            case PokerConst.PlayerAction.Raise:
        		this.LayoutRoot.classList.toggle("fold", false);
        		this.LayoutRoot.classList.toggle("allin", false);
        		this.LayoutRoot.classList.toggle("aggressive", true);
                this.ActionValue.innerHTML = argAggressiveLabel || "Raise";
                break;
            case PokerConst.PlayerAction.Fold:
        		this.LayoutRoot.classList.toggle("fold", true);
        		this.LayoutRoot.classList.toggle("allin", false);
        		this.LayoutRoot.classList.toggle("aggressive", false);
                this.ActionValue.innerHTML = "Fold";
                break;
            case PokerConst.PlayerAction.AllIn:
        		this.LayoutRoot.classList.toggle("fold", false);
        		this.LayoutRoot.classList.toggle("allin", true);
        		this.LayoutRoot.classList.toggle("aggressive", false);
                this.ActionValue.innerHTML = "All-In";
                break;
            default:
                break;
        }
    }

    /// <summary>
    /// 名前設定
    /// </summary>
    cProbePlayerMonitor.prototype.setName = function(argName)
    {
        this.NameValue.innerHTML = argName;
    }

    /// <summary>
    /// ポジション設定
    /// </summary>
    cProbePlayerMonitor.prototype.setPosition = function(argPosition)
    {
        this.PositionValue.innerHTML = argPosition;
    }

    /// <summary>
    /// 勝率の表示
    /// </summary>
    cProbePlayerMonitor.prototype.showWinRate = function(argWinRate)
    {
        if(argWinRate != null)
        {
            this.WinrateValue.innerHTML = `${argWinRate}%`;
        }
        else
        {
            this.WinrateValue.innerHTML = "";
        }
    }

    /// <summary>
    /// カードの表示
    /// </summary>
    cProbePlayerMonitor.prototype.showCard = function(argCard)
    {
        this.HolecardValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 2);
    }

    /// <summary>
    /// アクション中かどうかの表示
    /// </summary>
    cProbePlayerMonitor.prototype.setActing = function(argActing)
    {
        this.LayoutRoot.classList.toggle("active-player", argActing);
    }

    /// <summary>
    /// シートオープン状態にする
    /// </summary>
	cProbePlayerMonitor.prototype.toDead = function()
	{
		this.HtmlRoot.classList.toggle("seatopen", true);
	}

    /// <summary>
    /// シートにいる状態にする
    /// </summary>
	cProbePlayerMonitor.prototype.toAlive = function()
	{
		this.HtmlRoot.classList.toggle("seatopen", false);
	}

    /// <summary>
    /// 統計表示モード ON（通常グループを隠し、統計グループを表示）
    /// </summary>
    cProbePlayerMonitor.prototype.showStatsMode = function(argStats, argHandRange)
    {
        this.NormalGroup.style.display = "none";
        this.StatsGroup.style.display = "";
        this.HandCountValue.innerHTML = `Hands: ${argStats.handCount}`;
        this.VpipValue.innerHTML = `VPIP: ${argStats.getVpip()}%`;
        this.PfrValue.innerHTML = `PFR: ${argStats.getPfr()}%`;
        const threeBet = argStats.getThreeBet();
        this.ThreeBetValue.innerHTML = `3BET: ${threeBet["Rate"]}% (${threeBet["Attempt"]}/${threeBet["Opportunities"]})`;

        if (this.HandRangeCanvas && argHandRange)
        {
            argHandRange.draw(this.HandRangeCanvas);
        }
    }

    /// <summary>
    /// 統計表示モード OFF（通常グループを表示、統計グループを隠す）
    /// </summary>
    cProbePlayerMonitor.prototype.hideStatsMode = function()
    {
        this.NormalGroup.style.display = "";
        this.StatsGroup.style.display = "none";
    }

    cProbePlayerMonitor.prototype.showSpeechStatus = function(argText)
    {
        if (!this.SpeechStatus) return;
        this.SpeechStatus.innerHTML = argText || "音声: -";
    }

    ns.cProbePlayerMonitor = cProbePlayerMonitor;
})(Monitor = Monitor || {});
