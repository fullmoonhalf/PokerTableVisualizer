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
        this.LastupdateLabel = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, ns.Defines.TEMPLATE_PROBE_PANEL_LASTUPDATE_LABEL, "");
        this.LastupdateValue = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, ns.Defines.TEMPLATE_PROBE_PANEL_LASTUPDATE_VALUE, "");
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

    cProbeViewBase.prototype.updateLastupdateTime = function()
    {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm   = String(d.getMonth() + 1).padStart(2, "0");
        const dd   = String(d.getDate()).padStart(2, "0");
        const hh   = String(d.getHours()).padStart(2, "0");
        const mi   = String(d.getMinutes()).padStart(2, "0");
        const ss   = String(d.getSeconds()).padStart(2, "0");
        const formatted = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
        this.LastupdateValue.innerHTML = formatted;
    }

    /// 公開
    ns.cProbeViewBase = cProbeViewBase;
})(Monitor = Monitor || {});
