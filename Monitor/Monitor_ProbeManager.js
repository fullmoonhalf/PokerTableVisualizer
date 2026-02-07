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
        this.ButtonPlayer = null;
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


    /// <summary>
    /// ボタンの変更(直接指定)
    /// </summary>
    cProbeManager.prototype.changeButton = function(argPlayerModel)
    {
		// ポジションの計算(ディーラーに対する残り人数)
        this.ButtonPlayer = null;
		const alive_player_num = this.getAliveSeatCount();
		const button_index = this.PlayerProbeCollection.findIndex(x => x == argPlayerModel)
		let position_index = alive_player_num - 1;
		for(let count=0; count<this.PlayerProbeCollection.length; ++count)
		{
			const index = (button_index + count + 1) % this.PlayerProbeCollection.length;
			const seat = this.PlayerProbeCollection[index];
			if(seat.Alive)
			{
                const position = ns.Defines.convertPositionName(alive_player_num, position_index);
                seat.setPosition(position);
                if(position == ns.Defines.POKER_POSITION_DEALER)
                {
                    this.ButtonPlayer = seat;
                }
				position_index--;
			}
            else
            {
                seat.setPosition(ns.Defines.POKER_POSITION_OPENSEAT);
            }
		}
    }

    /// <summary>
    /// ボタンの変更(今の次にしたい)
    /// </summary>
    cProbeManager.prototype.changeButtonNext = function()
    {
        if(this.ButtonPlayer == null)
        {
            return;
        }

		const button_index = this.PlayerProbeCollection.findIndex(x => x == this.ButtonPlayer)
		for(let count=0; count<this.PlayerProbeCollection.length-1; ++count)
        {
			const index = (button_index + count + 1) % this.PlayerProbeCollection.length;
			const seat = this.PlayerProbeCollection[index];
			if(seat.Alive)
            {
                this.changeButton(seat);
                return;
            }
        }
    }

    /// <summary>
    /// 勝率計算
    /// </summary>
    cProbeManager.prototype.updateWinRate = function()
    {
		// 現在の制約上、フロップが開くまでは確率表示できない。
		const community_cards = this.DealerProbe.getCurrentCommunityCards();
		if(community_cards.length < 3)
		{
			return;
		}

		// 勝率計算処理に食わせられるようにする
		let index_table = [];
		let hand_info = [];
		for(let index=0; index<this.PlayerProbeCollection.length; ++index)
		{
			const seat = this.PlayerProbeCollection[index];
			seat.setWinRate(null);
			if(!seat.isActive())
			{
				continue;
			}
            if(seat.Cardslot.Cards == null)
            {
                continue;
            }
			if(seat.Cardslot.Cards.length < 2)
			{
				continue;
			}
			index_table.push(index);
			hand_info.push(seat.Cardslot.Cards);
		}

		// 勝率計算
		const result = WinRate.calc(hand_info, community_cards, [])
		for(let result_index=0; result_index<result.infos.length; ++result_index)
		{
			const access_index = index_table[result_index];
			const seat = this.PlayerProbeCollection[access_index];
			const result_unit = result.infos[result_index];
			const rate = Math.round((result_unit.win * 100 / result_unit.comb));
			seat.setWinRate(rate);
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
