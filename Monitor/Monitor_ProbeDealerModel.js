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
        this.BoardCurrentMonitor = null;
        this.HandCount = 0;
        this.SB = 0;
        this.BB = 0;
    }
    cProbeDealerModel.prototype = Object.create(ns.cProbeModelBase.prototype);
    cProbeDealerModel.prototype.constructor = cProbeDealerModel;


    /// <summary>
    /// コミュニティカードの取得
    /// </summary>
    cProbeDealerModel.prototype.getCurrentCommunityCards = function()
    {
        return []
        .concat(this.BoardFlopSlot.Cards ?? this.BoardFlopSlot.estimate())
        .concat(this.BoardTurnSlot.Cards ?? this.BoardTurnSlot.estimate())
        .concat(this.BoardRiverSlot.Cards ?? this.BoardRiverSlot.estimate());
    }


    /// <summary>
    /// モニターとの紐付け
    /// </summary>
    cProbeDealerModel.prototype.bindMonitor = function(argMonitor)
    {
        this.Monitor = argMonitor;
    }

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
        this.Monitor.resetCommunityCard();
        this.BoardCurrentSlot = null;
        this.BoardCurrentView = null;
        this.BoardCurrentMonitor = null;
    }

    /// <summary>
    /// </summary>
    cProbeDealerModel.prototype.onStartFlop = function()
    {
        this.BoardCurrentSlot = this.BoardFlopSlot;
        this.BoardCurrentView = this.View.showFlopCard.bind(this.View);
        this.BoardCurrentMonitor = this.Monitor.showFlopCard.bind(this.Monitor);
    }

    /// <summary>
    /// </summary>
    cProbeDealerModel.prototype.onStartTurn = function()
    {
        this.BoardFlopSlot.fix();
        this.BoardCurrentSlot = this.BoardTurnSlot;
        this.BoardCurrentView = this.View.showTurnCard.bind(this.View);
        this.BoardCurrentMonitor = this.Monitor.showTurnCard.bind(this.Monitor);
    }

    /// <summary>
    /// </summary>
    cProbeDealerModel.prototype.onStartRiver = function()
    {
        this.BoardTurnSlot.fix();
        this.BoardCurrentSlot = this.BoardRiverSlot;
        this.BoardCurrentView = this.View.showRiverCard.bind(this.View);
        this.BoardCurrentMonitor = this.Monitor.showRiverCard.bind(this.Monitor);
    }

    /// <summary>
    /// </summary>
    cProbeDealerModel.prototype.onStartEnd = function()
    {
        this.BoardCurrentSlot = null;
        this.BoardCurrentView = null;
        this.BoardCurrentMonitor = null;
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
                    if(this.BoardCurrentView != null)
                    {
                        this.BoardCurrentView(cards);
                    }
                    if(this.BoardCurrentMonitor != null)
                    {
                        this.BoardCurrentMonitor(cards);
                    }
                    ns.Engine.ProbeManager.updateWinRate();
                    if(well_read)
                    {
                        this.BoardCurrentSlot.fix();
                        ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.DEALER_PROBE_PREFIX);
                        ns.Engine.ProbeManager.updateWinRate();
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
            if(this.BoardCurrentView != null)
            {
                this.BoardCurrentView(null);
            }
            if(this.BoardCurrentMonitor != null)
            {
                this.BoardCurrentMonitor(null);
            }
            ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
        }
    }

    cProbeDealerModel.prototype.setHandCount = function(argCount)
    {
        this.HandCount = argCount;
        this.Monitor.showHandCount(this.HandCount);
    }

    cProbeDealerModel.prototype.setBlind = function(argSB, argBB)
    {
        this.SB = argSB;
        this.BB = argBB;
        this.Monitor.showBlind(this.SB, this.BB);
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
