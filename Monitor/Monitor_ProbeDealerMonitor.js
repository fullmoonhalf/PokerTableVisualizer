(function (ns) {
    "use strict";
	if(	ns.cProbeDealerMonitor )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeDealerMonitor(argHtmlRoot)
    {
        this.HtmlRoot = argHtmlRoot;

        this.DragableRoot = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORDEALER_PANEL_DRAGABLE_ROOT);
        this.DragableControl = new HtmlUtil.cDragableElement(this.DragableRoot);

        this.BoardValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORDEALER_PANEL_BOARD);
        this.HandcountValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORDEALER_PANEL_HANDCOUNT, "");
        this.BlindValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORDEALER_PANEL_BLIND, "");

        this.BoardFlopValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_FLOP_VALUE);
        this.BoardTurnValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_TURN_VALUE);
        this.BoardRiverValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_RIVER_VALUE);
    }
    cProbeDealerMonitor.prototype = Object.create(ns.cHtmlBase.prototype);
    cProbeDealerMonitor.prototype.constructor = cProbeDealerMonitor;

    /// <summary>
    /// flow の表示
    /// </summary>
    cProbeDealerMonitor.prototype.showFlopCard = function(argCard)
    {
        this.BoardFlopValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 3);
    }

    /// <summary>
    /// turn の表示
    /// </summary>
    cProbeDealerMonitor.prototype.showTurnCard = function(argCard)
    {
        this.BoardTurnValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 1);
    }

    /// <summary>
    /// river の表示
    /// </summary>
    cProbeDealerMonitor.prototype.showRiverCard = function(argCard)
    {
        this.BoardRiverValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 1);
    }

    /// <summary>
    /// ハンドカウントの表示
    /// </summary>
    cProbeDealerMonitor.prototype.showHandCount = function(argHandCount)
    {
        this.HandcountValue.innerHTML = `Hand: ${argHandCount}`;
    }

    /// <summary>
    /// ブラインドの表示
    /// </summary>
    cProbeDealerMonitor.prototype.showBlind = function(argSB, argBB)
    {
        this.BlindValue.innerHTML = `Blind: ${argSB}/${argBB}`;
    }


    ns.cProbeDealerMonitor = cProbeDealerMonitor;
})(Monitor = Monitor || {});
