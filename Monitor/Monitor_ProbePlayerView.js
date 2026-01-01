(function (ns) {
    "use strict";
	if(	ns.cProbePlayerView )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbePlayerView(argHtmlRoot)
    {
        this.Model = null;

        this.HtmlRoot = argHtmlRoot;
        this.NameLabel = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_NAME_LABEL, "");
        this.NameValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_NAME_VALUE);
        this.NickLabel = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_NICK_LABEL, "");
        this.NickInput = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_NICK_INPUT);

        ns.cProbeViewBase.call(this, this.HtmlRoot);

        HtmlUtil.addEventListenerToElement(this.NickInput, "change", this.onInputNick.bind(this));
    }
    cProbePlayerView.prototype = Object.create(ns.cProbeViewBase.prototype);
    cProbePlayerView.prototype.constructor = cProbePlayerView;

    /// <summary>
    /// モデルとの紐付け
    /// </summary>
    cProbePlayerView.prototype.bindModel = function(argModel)
    {
        this.Model = argModel;
    }

    /// <summary>
    /// ニックネーム入力時のイベントハンドラ
    /// </summary>
    cProbePlayerView.prototype.onInputNick = function(argEvent)
    {
        this.Model.setNick(argEvent.target.value);
    }

    /// <summary>
    /// 名前の表示
    /// </summary>
    cProbePlayerView.prototype.showName = function(argName)
    {
        this.NameValue.innerHTML = argName;
    }

    ns.cProbePlayerView = cProbePlayerView;

})(Monitor = Monitor || {});
