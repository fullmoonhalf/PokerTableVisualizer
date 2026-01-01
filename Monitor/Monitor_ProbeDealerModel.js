(function (ns) {
    "use strict";
	if(	ns.cProbeDealerModel )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeDealerModel()
    {
        ns.cProbeModelBase.call(this);
    }
    cProbeDealerModel.prototype = Object.create(ns.cProbeModelBase.prototype);
    cProbeDealerModel.prototype.constructor = cProbeDealerModel;

    /// <summary>
    /// View への表示
    /// </summary>
    cProbeDealerModel.prototype.showView = function()
    {
    }

    /// <summary>
    /// プローブからのデータ受け取り
    /// </summary>
    cProbeDealerModel.prototype.notifiedFromProbe = function(argValue)
    {
        this.setStatus(true);
        this.setBattery(argValue.battery);
        this.View.updateLastupdateTime();
    }

    /// 公開
    ns.cProbeDealerModel = cProbeDealerModel;
})(Monitor = Monitor || {});
