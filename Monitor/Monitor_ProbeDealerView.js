(function (ns) {
    "use strict";
	if(	ns.cProbeDealerView )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeDealerView(argHtmlRoot)
    {
        this.Model = null;
        this.HtmlRoot = argHtmlRoot;
        this.HandcountLabel = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_HANDCOUNT_LABEL, "");
        this.HandcountValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_HANDCOUNT_VALUE, "-");
        this.BlindSBInput = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BLIND_SB_INPUT);
        this.BlindBBInput = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BLIND_BB_INPUT);

        ns.cProbeViewBase.call(
            this, 
            this.HtmlRoot, 
            ns.Defines.TEMPLATE_PROBEDEALER_PANEL_STATUS_LABEL, 
            ns.Defines.TEMPLATE_PROBEDEALER_PANEL_STATUS_VALUE, 
            ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BATTERY_LABEL, 
            ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BATTERY_VALUE
        );
    }
    cProbeDealerView.prototype = Object.create(ns.cProbeViewBase.prototype);
    cProbeDealerView.prototype.constructor = cProbeDealerView;

    /// <summary>
    /// モデルとの紐付け
    /// </summary>
    cProbeDealerView.prototype.bindModel = function(argModel)
    {
        this.Model = argModel;
    }

    ns.cProbeDealerView = cProbeDealerView;
})(Monitor = Monitor || {});
