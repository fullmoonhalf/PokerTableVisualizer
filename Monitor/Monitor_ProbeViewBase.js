(function (ns) {
    "use strict";
	if(	ns.cProbeViewBase )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeViewBase(argHtmlRoot)
    {
        this.StatusLabel = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, ns.Defines.TEMPLATE_PROBE_PANEL_STATUS_LABEL, "📶");
        this.StatusValue = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, ns.Defines.TEMPLATE_PROBE_PANEL_STATUS_VALUE, "🚫");
        this.BatteryLabel = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, ns.Defines.TEMPLATE_PROBE_PANEL_BATTERY_LABEL, "🔋");
        this.BatteryValue = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, ns.Defines.TEMPLATE_PROBE_PANEL_BATTERY_VALUE, "-");
    }

    /// <summary>
    /// バッテリーレベルの表示
    /// </summary>
    cProbeViewBase.prototype.showBattery = function(argValue)
    {
        this.BatteryValue.innerHTML = argValue;
    }

    /// <summary>
    /// 接続状態の表示
    /// </summary>
    cProbeViewBase.prototype.showStatus = function(argValue)
    {
        this.StatusValue.innerHTML = argValue ? "✨" : "🚫";
    }

    /// 公開
    ns.cProbeViewBase = cProbeViewBase;
})(Monitor = Monitor || {});
