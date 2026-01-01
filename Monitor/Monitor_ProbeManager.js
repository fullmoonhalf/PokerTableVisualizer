(function (ns) {
    "use strict";
	if(	ns.cProbeManager )
	{
		return;
	}

    const PLAYER_PROBE_LIST = [
        "Player01",
        "Player02",
        "Player03",
        "Player04",
        "Player05",
        "Player06",
        "Player07",
        "Player08",
        "Player09",
    ];
    const DEALER_PROBE_PREFIX = "Dealer";

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeManager()
    {
        this.PlayerProbeCollection = {};
        this.DealerProbe = null;
    }

    /// <summary>
    /// 初期化
    /// </summary>
    cProbeManager.prototype.init = function()
    {
        // プレイヤー
        for(const player_probe_name of PLAYER_PROBE_LIST)
        {
            const model = new ns.cProbePlayerModel(player_probe_name);
            const view = ns.Engine.ViewManager.createProbePlayerView();
            view.bindModel(model);
            model.bindView(view);
            model.showView();
            this.PlayerProbeCollection[player_probe_name] = model;
        }

        // ディーラー
        {
            const view = ns.Engine.ViewManager.createProbeDealerView();
            this.DealerProbe = new ns.cProbeDealerModel();
            view.bindModel(this.DealerProbe)
            this.DealerProbe.bindView(view);
            this.DealerProbe.showView();
        }
    }

    /// <summary>
    /// プローブの離断通知
    /// </summary>
    cProbeManager.prototype.onRemoveProbe = function(argTarget, argValue)
    {
        const model = this._findModel(argTarget);
        if(model)
        {
            model.setStatus(false);
        }
    }

    /// <summary>
    /// プローブからの通知
    /// </summary>
    cProbeManager.prototype.notifiedFromProbe = function(argTarget, argValue)
    {
        console.log(argValue);
        const model = this._findModel(argTarget);
        if(model)
        {
            model.notifiedFromProbe(argValue);
        }
    }

    /// <summary>
    /// モデルの取得
    /// </summary>
    cProbeManager.prototype._findModel = function(argTarget)
    {
        if(argTarget in this.PlayerProbeCollection)
        {
            const model = this.PlayerProbeCollection[argTarget];
            return model;
        }

        return this.DealerProbe;
    }

    ns.cProbeManager = cProbeManager;
})(Monitor = Monitor || {});
