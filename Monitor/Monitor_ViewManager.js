(function (ns) {
    "use strict";
	if(	ns.cViewManager )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cViewManager()
    {
        this.ContainerProbePlayer = document.getElementById(ns.Defines.CONTAINER_PROBEPLAYER_PANEL);
        this.ContainerProbeDealer = document.getElementById(ns.Defines.CONTAINER_PROBEDEALER_PANEL);
        this.TemplateProbePlayer =  HtmlUtil.searchNodeByClassNameFromDocument(ns.Defines.TEMPLATE_PROBEPLAYER_PANEL);
        this.TemplateProbeDealer =  HtmlUtil.searchNodeByClassNameFromDocument(ns.Defines.TEMPLATE_PROBEDEALER_PANEL);
    }

    /// <summary>
    /// 画面のセットアップ
    /// </summary>
    cViewManager.prototype.setup = function()
    {
    }

    /// <summary>
    /// ProbePlayerView パネルの生成
    /// </summary>
    cViewManager.prototype.createProbePlayerView = function()
    {
        const node = this.TemplateProbePlayer.cloneNode(true);
        this.ContainerProbePlayer.appendChild(node);
        return new ns.cProbePlayerView(node);
    }

    /// <summary>
    /// ProbeDealerView パネルの生成
    /// </summary>
    cViewManager.prototype.createProbeDealerView = function()
    {
        const node = this.TemplateProbeDealer.cloneNode(true);
        this.ContainerProbeDealer.appendChild(node);
        return new ns.cProbeDealerView(node);
    }

    /// 公開
    ns.cViewManager = cViewManager;
})(Monitor = Monitor || {});
