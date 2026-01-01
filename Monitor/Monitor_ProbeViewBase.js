(function (ns) {
    "use strict";
	if(	ns.cProbeViewBase )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeViewBase(argHtmlRoot, argStatusLabelCssClass, argStatusValueCssClass, argBatteryLabelCssClass, argBatteryValueCssClass)
    {
        this.StatusLabel = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, argStatusLabelCssClass, "📶");
        this.StatusValue = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, argStatusValueCssClass, "🚫");
        this.BatteryLabel = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, argBatteryLabelCssClass, "🔋");
        this.BatteryValue = HtmlUtil.searchNodeByClassNameFromChildren(argHtmlRoot, argBatteryValueCssClass, "-");
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
