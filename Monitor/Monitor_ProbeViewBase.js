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
        this.ControlRescanButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBE_PANEL_CONTROL_RESCAN );

        HtmlUtil.addEventListenerToElement(this.ControlRescanButton, "click", this._onControlRescan.bind(this));

        this.setActiveButton(this.ControlRescanButton);
    }

    /// <summary>
    /// モデルとの紐付け
    /// </summary>
    cProbeViewBase.prototype.bindModel = function(argModel)
    {
        this.Model = argModel;
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

    /// <summary>
    /// 更新時刻の更新
    /// </summary>
    cProbeViewBase.prototype.updateLastupdateTime = function()
    {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm   = String(d.getMonth() + 1).padStart(2, "0");
        const dd   = String(d.getDate()).padStart(2, "0");
        const hh   = String(d.getHours()).padStart(2, "0");
        const mi   = String(d.getMinutes()).padStart(2, "0");
        const ss   = String(d.getSeconds()).padStart(2, "0");
        const formatted = `${hh}:${mi}:${ss}`;
        this.LastupdateValue.innerHTML = formatted;
    }

    /// <summary>
    /// 更新時刻の更新
    /// </summary>
    cProbeViewBase.prototype.createHoleCardsHTML = function (argHoleCards, argClassName, argCapacity)
	{
		let html = "";
		let index = 0;
        if(argHoleCards)
        {
            for(const card of argHoleCards)
            {
                html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-${card}.png">`;
                index++;
            }
        }
		while(index < argCapacity)
		{
			html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-0.png">`;
			index++;
		}
		return html;
	}

    /// <summary>
    /// ボタンを active 状態にする
    /// </summary>
    cProbeViewBase.prototype.setActiveButton = function(argButton)
    {
        argButton.classList.toggle("active", true);
        argButton.classList.toggle("inactive", false);
    }

    /// <summary>
    /// ボタンを inactive 状態にする
    /// </summary>
    cProbeViewBase.prototype.setInactiveButton = function(argButton)
    {
        argButton.classList.toggle("active", false);
        argButton.classList.toggle("inactive", true);
    }

    /// <summary>
    /// </summary>
    cProbeViewBase.prototype._onControlRescan = function(argEvent)
    {
        this.Model.rescan();
    }
    /// 公開
    ns.cProbeViewBase = cProbeViewBase;
})(Monitor = Monitor || {});
