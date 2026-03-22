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
        this.ActionPlayer = null;
        this.DealerProbe = null;
        this.BetStage = 1;
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
                this.BetStage = 1;
                this.resetActionPlayer();
                this.Carddeck.reset();
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartDeal();
                }
                this.DealerProbe.onStartDeal();
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.PLAYER_PROBE_PREFIX);
                break;
            case PokerConst.BettingRound.Preflop:
                this.BetStage = 2;
                this.resetActionPlayer();
                ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.PLAYER_PROBE_PREFIX);
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartBettingRound();
                }
                this._updateAggressiveButtonLabels();
                this.setActionPlayer(this.getFirstActionPlayer(PokerConst.BettingRound.Preflop));
                break;
            case PokerConst.BettingRound.Flop:
                this.BetStage = 1;
                this.resetActionPlayer();
                ns.Engine.ProbeDeviceManager.writeStopScan(ns.Defines.PLAYER_PROBE_PREFIX);
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartNextBettingRound();
                }
                this._updateAggressiveButtonLabels();
                this.DealerProbe.onStartFlop();
                this.setActionPlayer(this.getFirstActionPlayer(PokerConst.BettingRound.Flop));
                break;
            case PokerConst.BettingRound.Turn:
                this.BetStage = 1;
                this.resetActionPlayer();
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartNextBettingRound();
                }
                this._updateAggressiveButtonLabels();
                this.DealerProbe.onStartTurn();
                this.setActionPlayer(this.getFirstActionPlayer(PokerConst.BettingRound.Turn));
                break;
            case PokerConst.BettingRound.River:
                this.BetStage = 1;
                this.resetActionPlayer();
                ns.Engine.ProbeDeviceManager.writeStartScan(ns.Defines.DEALER_PROBE_PREFIX);
                for(const probe of this.PlayerProbeCollection)
                {
                    probe.onStartNextBettingRound();
                }
                this._updateAggressiveButtonLabels();
                this.DealerProbe.onStartRiver();
                this.setActionPlayer(this.getFirstActionPlayer(PokerConst.BettingRound.River));
                break;
            case PokerConst.BettingRound.EndHand:
                this.BetStage = 1;
                this.resetActionPlayer();
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
    /// アクション中プレイヤーの設定
    /// </summary>
    cProbeManager.prototype.setActionPlayer = function(argPlayerModel)
    {
        if (this.ActionPlayer != null) {
            this.ActionPlayer.setActing(false);
        }
        this.ActionPlayer = argPlayerModel;
        if (this.ActionPlayer != null) {
            this.ActionPlayer.setActing(true);
        }
    }

    /// <summary>
    /// アクション中プレイヤーのリセット
    /// </summary>
    cProbeManager.prototype.resetActionPlayer = function()
    {
        this.setActionPlayer(null);
    }

    /// <summary>
    /// プレイヤーがアクションを実行したときの処理
    /// </summary>
    cProbeManager.prototype.onPlayerActed = function(argModel, argAction)
    {
        argModel.ActedInRound = true;
        argModel.Reactionable = false;

        switch (argAction) {
            case PokerConst.PlayerAction.Call:
            case PokerConst.PlayerAction.Bet:
                {
                    for (const probe of this.PlayerProbeCollection)
                    {
                        if (probe == argModel) continue;
                        if (!probe.Alive) continue;
                        if (probe.LastAction == PokerConst.PlayerAction.Fold) continue;
                        if (probe.LastAction == PokerConst.PlayerAction.AllIn) continue;
                        if (probe.ActedInRound &&
                            (probe.LastAction == PokerConst.PlayerAction.Check))
                        {
                            probe.Reactionable = true;
                        }
                    }
                }
                break;
            case PokerConst.PlayerAction.Raise:
            case PokerConst.PlayerAction.AllIn:
                {
                    for (const probe of this.PlayerProbeCollection)
                    {
                        if (probe == argModel) continue;
                        if (!probe.Alive) continue;
                        if (probe.LastAction == PokerConst.PlayerAction.Fold) continue;
                        if (probe.LastAction == PokerConst.PlayerAction.AllIn) continue;
                        if (probe.ActedInRound &&
                            (probe.LastAction == PokerConst.PlayerAction.Check ||
                            probe.LastAction == PokerConst.PlayerAction.Call  ||
                            probe.LastAction == PokerConst.PlayerAction.Bet  ||
                            probe.LastAction == PokerConst.PlayerAction.Raise))
                        {
                            probe.Reactionable = true;
                        }
                    }
                }
                break;
        }

        if (argAction == PokerConst.PlayerAction.Bet || argAction == PokerConst.PlayerAction.Raise)
        {
            this.BetStage++;
            this._updateAggressiveButtonLabels();
        }

        const nextPlayer = this.getNextActionPlayer(argModel);
        this.setActionPlayer(nextPlayer);
    }

    /// <summary>
    /// ベッティングラウンド開始時の最初のアクションプレイヤーを取得
    /// </summary>
    cProbeManager.prototype.getFirstActionPlayer = function(argBettingRound)
    {
        const aliveCount = this.getAliveSeatCount();
        if (aliveCount < 2) return null;

        if (argBettingRound == PokerConst.BettingRound.Preflop)
        {
            const startPositionName = ns.Defines.getPreflopStartPositionName(aliveCount);
            if (startPositionName == null) return null;

            // 指定されたポジションのプレイヤーを探す
            const startPlayer = this.PlayerProbeCollection.find(
                p => p.Alive && p.Position == startPositionName && p.isActionable()
            );
            if (startPlayer) return startPlayer;

            // 見つからない場合は、そのポジションのランクから次のアクション可能プレイヤーを探す
            const startRank = ns.Defines.getPositionRank(startPositionName);
            return this._findNextActionableFromRank(startRank);
        }
        else
        {
            // フロップ/ターン/リバー: 最も不利（ランクが最大）なアクション可能プレイヤー
            let bestPlayer = null;
            let bestRank = -1;
            for (const probe of this.PlayerProbeCollection)
            {
                if (!probe.isActionable()) continue;
                const rank = ns.Defines.getPositionRank(probe.Position);
                if (rank > bestRank)
                {
                    bestRank = rank;
                    bestPlayer = probe;
                }
            }
            return bestPlayer;
        }
    }

    /// <summary>
    /// 現在のプレイヤーの次のアクションプレイヤーを取得
    /// </summary>
    cProbeManager.prototype.getNextActionPlayer = function(argCurrentPlayer)
    {
        const currentRank = ns.Defines.getPositionRank(argCurrentPlayer.Position);

        // 現在より有利（ランクが低い）なアクション可能プレイヤーを探す
        let nextPlayer = null;
        let nextRank = -1;
        for (const probe of this.PlayerProbeCollection)
        {
            if (!probe.isActionable()) continue;
            const rank = ns.Defines.getPositionRank(probe.Position);
            if (rank < currentRank && rank > nextRank)
            {
                nextRank = rank;
                nextPlayer = probe;
            }
        }
        if (nextPlayer) return nextPlayer;

        // 有利側に見つからない場合は最も不利なアクション可能プレイヤーに戻る（ラップアラウンド）
        // 全プレイヤーを対象に最も不利（ランク最大）なアクション可能プレイヤーを返す
        return this._findMostDisadvantagedActionable();
    }

    /// <summary>
    /// 指定ランク以下で最もランクが高い（不利な）アクション可能プレイヤーを取得
    /// </summary>
    cProbeManager.prototype._findNextActionableFromRank = function(argMaxRank)
    {
        let bestPlayer = null;
        let bestRank = -1;
        for (const probe of this.PlayerProbeCollection)
        {
            if (!probe.isActionable()) continue;
            const rank = ns.Defines.getPositionRank(probe.Position);
            if (rank <= argMaxRank && rank > bestRank)
            {
                bestRank = rank;
                bestPlayer = probe;
            }
        }
        return bestPlayer;
    }

    /// <summary>
    /// 全アクション可能プレイヤーの中で最も不利（ランク最大）なプレイヤーを取得
    /// </summary>
    cProbeManager.prototype._findMostDisadvantagedActionable = function()
    {
        let bestPlayer = null;
        let bestRank = -1;
        for (const probe of this.PlayerProbeCollection)
        {
            if (!probe.isActionable()) continue;
            const rank = ns.Defines.getPositionRank(probe.Position);
            if (rank > bestRank)
            {
                bestRank = rank;
                bestPlayer = probe;
            }
        }
        return bestPlayer;
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
		const community_cards = this.DealerProbe.getCurrentCommunityCards();

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
            const cards = seat.Cardslot.Cards ?? seat.Cardslot.estimate();
            if(cards == null)
            {
                continue;
            }
            if(cards.length < 2)
			{
				continue;
			}
			index_table.push(index);
            hand_info.push(cards);
		}

        if(hand_info.length < 2)
        {
            return;
        }

		// 勝率計算
        const result = community_cards.length >= 3
            ? WinRate.calc(hand_info, community_cards, [])
            : this._calcMonteCarloWinRate(hand_info, community_cards, 1000);
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
    /// フロップ未満の勝率をモンテカルロで推定する
    /// </summary>
    cProbeManager.prototype._calcMonteCarloWinRate = function(argHands, argBoard, argTrialCount)
    {
        const exclude = []
            .concat(...argHands)
            .concat(argBoard ?? []);
        const baseDeck = WinRate.genDeck(exclude);
        const drawCount = 5 - argBoard.length;
        const infos = argHands.map(hand => ({
            hand: hand,
            win: 0,
            comb: argTrialCount,
        }));

        for(let trial = 0; trial < argTrialCount; ++trial)
        {
            const remainDeck = baseDeck.slice();
            const sampledBoard = argBoard.slice();
            for(let draw = 0; draw < drawCount; ++draw)
            {
                const index = Math.floor(Math.random() * remainDeck.length);
                sampledBoard.push(remainDeck[index]);
                remainDeck.splice(index, 1);
            }

            let winners = [];
            let maxPower = 0;
            for(let handIndex = 0; handIndex < argHands.length; ++handIndex)
            {
                const power = WinRate.calcPower7Cards(argHands[handIndex].concat(sampledBoard));
                if(maxPower < power)
                {
                    maxPower = power;
                    winners = [handIndex];
                }
                else if(maxPower == power)
                {
                    winners.push(handIndex);
                }
            }

            for(const winnerIndex of winners)
            {
                infos[winnerIndex].win++;
            }
        }

        return {
            infos: infos,
        };
    }

    /// <summary>
    /// 現在のベット段階のラベルを取得する
    /// </summary>
    cProbeManager.prototype.getBetStageLabel = function()
    {
        if (this.BetStage === 1) return "Bet";
        if (this.BetStage === 2) return "Raise";
        return this.BetStage + "-Bet";
    }

    /// <summary>
    /// 現在のベット段階に対応するプレイヤーアクションを取得する
    /// </summary>
    cProbeManager.prototype.getAggressivePlayerAction = function()
    {
        return this.BetStage === 1 ? PokerConst.PlayerAction.Bet : PokerConst.PlayerAction.Raise;
    }

    /// <summary>
    /// 全プレイヤービューのアグレッシブボタンラベルを更新する
    /// </summary>
    cProbeManager.prototype._updateAggressiveButtonLabels = function()
    {
        const label = this.getBetStageLabel();
        for (const probe of this.PlayerProbeCollection)
        {
            if (probe.isActionable())
            {
                probe.View.updateAggressiveButtonLabel(label);
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
