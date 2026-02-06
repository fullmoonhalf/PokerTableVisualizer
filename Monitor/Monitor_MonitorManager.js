(function (ns) {
    "use strict";
	if(	ns.cMonitorManager )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cMonitorManager()
    {
        this.ContainerMonitorPlayer = document.getElementById(ns.Defines.CONTAINER_MONITORPLAYER_PANEL);
        this.TemplateMonitorPlayer = HtmlUtil.searchNodeByClassNameFromDocument(ns.Defines.TEMPLATE_MONITORPLAYER_PANEL);
    }

    /// <summary>
    /// 画面のセットアップ
    /// </summary>
    cMonitorManager.prototype.setup = function()
    {
    }

    /// <summary>
    /// ProbePlayerView パネルの生成
    /// </summary>
    cMonitorManager.prototype.createMonitorPlayer = function()
    {
        const node = this.TemplateMonitorPlayer.cloneNode(true);
        this.ContainerMonitorPlayer.appendChild(node);
        return new ns.cProbePlayerMonitor(node);
    }

    /// 公開
    ns.cMonitorManager = cMonitorManager;
})(Monitor = Monitor || {});
