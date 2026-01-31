(function (ns) {
    "use strict";
	if(	ns.cProbePlayerModel )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbePlayerModel(argName, argCardslot)
    {
        ns.cProbeModelBase.call(this);
        this.Name = argName;
        this.Nick = argName;
        this.Alive = false;
        this.LastAction = PokerConst.PlayerAction.None;
        this.Cardslot = argCardslot;
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
    /// ディールの開始
    /// </summary>
    cProbePlayerModel.prototype.onStartDeal = function()
    {
        this.Cardslot.reset();
        this.View.showCard(null);
    }

    /// <summary>
    /// プレイヤーアクションの設定
    /// </summary>
    cProbePlayerModel.prototype.setPlayerAction = function(argPlayerAction)
    {
        this.LastAction = argPlayerAction;
        this.View.showPlayerAction(this.LastAction);
    }

    /// <summary>
    /// Alive 属性の反転
    /// </summary>
    cProbePlayerModel.prototype.toggleAlive = function(argValue)
    {
        if(this.Alive)
        {
            this.Alive = false;
            this.View.toDead();
        }
        else
        {
            this.Alive = true;
            this.View.toAlive();
        }
    }

    /// <summary>
    /// プローブからのデータ受け取り
    /// </summary>
    cProbePlayerModel.prototype.notifiedFromProbe = function(argValue)
    {
        // 基本情報
        this.setStatus(true);
        this.setBattery(argValue.battery);
        this.View.updateLastupdateTime();

        // モードに合わせた対応
        switch(argValue.mode)
        {
            case "scan":
                {
                    const well_read = this.Cardslot.scan(argValue);
                    const cards = this.Cardslot.estimate();
                    this.View.showCard(cards);
                    if(well_read)
                    {
                        ns.Engine.ProbeDeviceManager.writeStopScan(this.Name);
                    }
                }
                break;
        }
    }
    
    /// <summary>
    /// プローブに再スキャン要求
    /// </summary>
    cProbePlayerModel.prototype.rescan = function()
    {
        this.Cardslot.reset();
        this.View.showCard(null);
        ns.Engine.ProbeDeviceManager.writeStartScan(this.Name);
    }

    /// <summary>
    /// View への表示
    /// </summary>
    cProbePlayerModel.prototype.showView = function()
    {
        this.View.showName(this.Name);
    }

    ns.cProbePlayerModel = cProbePlayerModel;
})(Monitor = Monitor || {});
