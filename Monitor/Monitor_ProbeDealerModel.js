(function (ns) {
    "use strict";
	if(	ns.cProbeDealerModel )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeDealerModel(argBoardFlopSlot, argBoardTrunSlot, argBoardRiverSlot)
    {
        ns.cProbeModelBase.call(this);
        this.BettingRound = PokerConst.BettingRound.Invalid;
        this.Deck = null;
        this.BoardFlopSlot = argBoardFlopSlot;
        this.BoardTurnSlot = argBoardTrunSlot;
        this.BoardRiverSlot = argBoardRiverSlot;
        this.BoardCurrentSlot = null;
        this.BoardCurrentView = null;
    }
    cProbeDealerModel.prototype = Object.create(ns.cProbeModelBase.prototype);
    cProbeDealerModel.prototype.constructor = cProbeDealerModel;

    /// <summary>
    /// ベッティングラウンドの設定
    /// </summary>
    cProbeDealerModel.prototype.setBettingRound = function(argBettingRound)
    {
        this.BettingRound = argBettingRound;
        ns.Engine.ProbeManager.onChangeBettingRound(argBettingRound);
        this.View.showBettingRound(this.BettingRound);
    }

    /// <summary>
    /// ディールの開始
    /// </summary>
    cProbeDealerModel.prototype.onStartDeal = function()
    {
        this.BoardFlopSlot.reset();
        this.BoardTurnSlot.reset();
        this.BoardRiverSlot.reset();
        this.BoardCurrentSlot = null;
        this.BoardCurrentView = null;
    }

    /// <summary>
    /// </summary>
    cProbeDealerModel.prototype.onStartFlop = function()
    {
        this.BoardCurrentSlot = this.BoardFlopSlot;
        this.BoardCurrentView = this.View.showFlopCard.bind(this.View);
    }

    /// <summary>
    /// </summary>
    cProbeDealerModel.prototype.onStartTurn = function()
    {
        this.BoardFlopSlot.fix();
        this.BoardCurrentSlot = this.BoardTurnSlot;
        this.BoardCurrentView = this.View.showTurnCard.bind(this.View);
    }

    /// <summary>
    /// </summary>
    cProbeDealerModel.prototype.onStartRiver = function()
    {
        this.BoardTurnSlot.fix();
        this.BoardCurrentSlot = this.BoardRiverSlot;
        this.BoardCurrentView = this.View.showRiverCard.bind(this.View);
    }

    /// <summary>
    /// </summary>
    cProbeDealerModel.prototype.onStartEnd = function()
    {
        this.BoardCurrentSlot = null;
        this.BoardCurrentView = null;
    }

    /// <summary>
    /// プローブからのデータ受け取り
    /// </summary>
    cProbeDealerModel.prototype.notifiedFromProbe = function(argValue)
    {
        // モードに合わせた対応
        switch(argValue.mode)
        {
            case "scan":
                if(this.BoardCurrentSlot)
                {
                    const well_read = this.BoardCurrentSlot.scan(argValue)
                    const cards = this.BoardCurrentSlot.estimate();
                    this.BoardCurrentView(cards);
                    if(well_read)
                    {
                        ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.DEALER_PROBE_PREFIX);
                    }
                }
                break;
        }

        // 共通
        this.setStatus(true);
        this.setBattery(argValue.battery);
        this.View.updateLastupdateTime();
    }

    /// <summary>
    /// プローブに再スキャン要求
    /// </summary>
    cProbeDealerModel.prototype.rescan = function()
    {
        if(this.BoardCurrentSlot)
        {
            this.BoardCurrentSlot.reset();
            this.BoardCurrentView(null);
            ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
        }
    }

    /// <summary>
    /// View への表示
    /// </summary>
    cProbeDealerModel.prototype.showView = function()
    {
    }

    /// 公開
    ns.cProbeDealerModel = cProbeDealerModel;
})(Monitor = Monitor || {});
