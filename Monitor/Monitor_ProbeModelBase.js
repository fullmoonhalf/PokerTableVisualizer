(function (ns) {
    "use strict";
	if(	ns.cProbeModelBase )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeModelBase()
    {
        this.Status = false;
        this.Battery = 0;
        this.View = null;
    }

    /// <summary>
    /// ステータスの設定
    /// </summary>
    cProbeModelBase.prototype.setStatus = function(argStatus)
    {
        this.Status = argStatus;
        this.View.showStatus(this.Status);
    }

    /// <summary>
    /// バッテリーの設定
    /// </summary>
    cProbeModelBase.prototype.setBattery = function(argBattery)
    {
        this.Battery = argBattery;
        this.View.showBattery(this.Battery);
    }

    /// <summary>
    /// View との紐付け
    /// </summary>
    cProbeModelBase.prototype.bindView = function(argView)
    {
        this.View = argView;
    }

    /// 公開
    ns.cProbeModelBase = cProbeModelBase;
})(Monitor = Monitor || {});
