(function (ns) {
    "use strict";
	if(	ns.cProbeManager )
	{
		return;
	}

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
        this.Carddeck = new ns.cCarddeck();

        // プレイヤー
        for(const player_probe_name of ns.Defines.PLAYER_PROBE_LIST)
        {
            const cardslot = new ns.cCardslot(this.Carddeck, 2);
            const model = new ns.cProbePlayerModel(player_probe_name, cardslot);
            const view = ns.Engine.ViewManager.createProbePlayerView();
            view.bindModel(model);
            model.bindView(view);
            model.showView();
            this.PlayerProbeCollection[player_probe_name] = model;
        }

        // ディーラー
        {
            const cardslot_flop = new ns.cCardslot(this.Carddeck, 3);
            const cardslot_turn = new ns.cCardslot(this.Carddeck, 1);
            const cardslot_river = new ns.cCardslot(this.Carddeck, 1);
            const view = ns.Engine.ViewManager.createProbeDealerView();
            this.DealerProbe = new ns.cProbeDealerModel(cardslot_flop, cardslot_turn, cardslot_river);
            view.bindModel(this.DealerProbe)
            this.DealerProbe.bindView(view);
            this.DealerProbe.showView();
            this.DealerProbe.setBettingRound(PokerConst.BettingRound.DealHand);
        }
    }

    /// <summary>
    /// </summary>
    cProbeManager.prototype.onChangeBettingRound = function(argBettingRound)
    {
        switch(argBettingRound)
        {
            case PokerConst.BettingRound.DealHand:
                this.Carddeck.reset();
                Object.values(this.PlayerProbeCollection).forEach(probe => probe.onStartDeal());
                this.DealerProbe.onStartDeal();
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.PLAYER_PROBE_PREFIX);
                break;
            case PokerConst.BettingRound.Preflop:
                break;
            case PokerConst.BettingRound.Flop:
                ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.PLAYER_PROBE_PREFIX);
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                this.DealerProbe.onStartFlop();
                break;
            case PokerConst.BettingRound.Turn:
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                this.DealerProbe.onStartTurn();
                break;
            case PokerConst.BettingRound.River:
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                this.DealerProbe.onStartRiver();
                break;
            case PokerConst.BettingRound.EndHand:
                ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.PLAYER_PROBE_PREFIX);
                ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.DEALER_PROBE_PREFIX);
                this.DealerProbe.onStartEnd();
                break;
            default:
                break;
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
