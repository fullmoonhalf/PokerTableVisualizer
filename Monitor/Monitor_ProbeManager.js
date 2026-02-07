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
        this.PlayerProbeCollection = [];
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
            const monitor = ns.Engine.MonitorManager.createMonitorPlayer();
            view.bindModel(model);
            model.bindView(view);
            model.bindMonitor(monitor);
            model.showView();
            this.PlayerProbeCollection.push(model);
        }

        // ディーラー
        {
            const cardslot_flop = new ns.cCardslot(this.Carddeck, 3);
            const cardslot_turn = new ns.cCardslot(this.Carddeck, 1);
            const cardslot_river = new ns.cCardslot(this.Carddeck, 1);
            const view = ns.Engine.ViewManager.createProbeDealerView();
            const monitor = ns.Engine.MonitorManager.createMonitorDealer();
            this.DealerProbe = new ns.cProbeDealerModel(cardslot_flop, cardslot_turn, cardslot_river);
            view.bindModel(this.DealerProbe)
            this.DealerProbe.bindView(view);
            this.DealerProbe.bindMonitor(monitor);
            this.DealerProbe.showView();
        }
    }

    /// <summary>
    /// ベッティングラウンドが進んだときの処理
    /// </summary>
    cProbeManager.prototype.onChangeBettingRound = function(argBettingRound)
    {
        switch(argBettingRound)
        {
            case PokerConst.BettingRound.DealHand:
                this.Carddeck.reset();
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartDeal();
                }
                this.DealerProbe.onStartDeal();
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.PLAYER_PROBE_PREFIX);
                break;
            case PokerConst.BettingRound.Preflop:
                ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.PLAYER_PROBE_PREFIX);
                break;
            case PokerConst.BettingRound.Flop:
                ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.PLAYER_PROBE_PREFIX);
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartNextBettingRound();
                }
                this.DealerProbe.onStartFlop();
                break;
            case PokerConst.BettingRound.Turn:
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartNextBettingRound();
                }
                this.DealerProbe.onStartTurn();
                break;
            case PokerConst.BettingRound.River:
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartNextBettingRound();
                }
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
    /// 生きているシートカウント
    /// </summary>
    cProbeManager.prototype.getAliveSeatCount = function()
    {
        let count = 0;
        for(const probe of this.PlayerProbeCollection)
        {
            if(probe.Alive)
            {
                count++;
            }
        }
        return count;
    }


    cProbeManager.prototype.changeButton = function(argPlayerModel)
    {
        for(const probe of this.PlayerProbeCollection)
        {
            console.log(probe);
        }

		// ポジションの計算(ディーラーに対する残り人数)
		const alive_player_num = this.getAliveSeatCount();
		const button_index = this.PlayerProbeCollection.findIndex(x => x == argPlayerModel)
		let position_index = alive_player_num - 1;
		for(let count=0; count<this.PlayerProbeCollection.length; ++count)
		{
			let index = (button_index + count + 1) % this.PlayerProbeCollection.length;
			const seat = this.PlayerProbeCollection[index];
			if(seat.Alive)
			{
                const position = ns.Defines.convertPositionName(alive_player_num, position_index);
                seat.setPosition(position);
				position_index--;
			}
            else
            {
                seat.setPosition(ns.Defines.POKER_POSITION_OPENSEAT);
            }
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
        console.log(new Date(), argValue);
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
        for(const probe of this.PlayerProbeCollection)
        {
            if(probe.Name == argTarget)
            {
                return probe;
            }
        }

        return this.DealerProbe;
    }

    ns.cProbeManager = cProbeManager;
})(Monitor = Monitor || {});
