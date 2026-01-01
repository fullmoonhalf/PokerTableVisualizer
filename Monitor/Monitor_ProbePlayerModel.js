(function (ns) {
    "use strict";
	if(	ns.cProbePlayerModel )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbePlayerModel(argName)
    {
        ns.cProbeModelBase.call(this);
        this.Name = argName;
        this.Nick = argName;
    }
    cProbePlayerModel.prototype = Object.create(ns.cProbeModelBase.prototype);
    cProbePlayerModel.prototype.constructor = cProbePlayerModel;

    /// <summary>
    /// ニックネームの設定
    /// </summary>
    cProbePlayerModel.prototype.setNick = function(argNick)
    {
        this.Nick = argNick;
    }

    /// <summary>
    /// View への表示
    /// </summary>
    cProbePlayerModel.prototype.showView = function()
    {
        this.View.showName(this.Name);
    }

    /// <summary>
    /// プローブからのデータ受け取り
    /// </summary>
    cProbePlayerModel.prototype.notifiedFromProbe = function(argValue)
    {
        this.setStatus(true);
        this.setBattery(argValue.battery);
        this.View.updateLastupdateTime();
    }
    
    ns.cProbePlayerModel = cProbePlayerModel;
})(Monitor = Monitor || {});
