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

        this.NameValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_NAME_VALUE, "");
        this.WinrateValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_WINRATE_VALUE, "");
        this.ActionValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_ACTION_VALUE, "");
        this.PositionValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_POSITION_VALUE, "");
        this.HolecardValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_MONITORPLAYER_PANEL_HOLECARD_VALUE);
    }
    cProbePlayerMonitor.prototype = Object.create(ns.cHtmlBase.prototype);
    cProbePlayerMonitor.prototype.constructor = cProbePlayerMonitor;

    /// <summary>
    /// 名前設定
    /// </summary>
    cProbePlayerMonitor.prototype.setName = function(argName)
    {
        this.NameValue.innerHTML = argName;
    }

    /// <summary>
    /// カードの表示
    /// </summary>
    cProbePlayerMonitor.prototype.showCard = function(argCard)
    {
        this.HolecardValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 2);
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
    

    ns.cProbePlayerMonitor = cProbePlayerMonitor;
})(Monitor = Monitor || {});
