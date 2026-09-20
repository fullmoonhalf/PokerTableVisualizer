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
        this.ActedInRound = false;
        this.Reactionable = false;
        this.Cardslot = argCardslot;
        this.Position = ns.Defines.POKER_POSITION_OPENSEAT;
        this.Stats = new ns.PlayerStats();
        this.HandFlags = new ns.HandStatsFlags();
        this.HandRange = new ns.cHandRange();
        this.PreflopFirstActionRecorded = false;
    }
    cProbePlayerModel.prototype = Object.create(ns.cProbeModelBase.prototype);
    cProbePlayerModel.prototype.constructor = cProbePlayerModel;


    /// <summary>
    /// モニターとのひもづけ
    /// </summary>
    cProbePlayerModel.prototype.bindMonitor = function(argMonitor)
    {
        this.Monitor = argMonitor;
    }


    /// <summary>
    /// ニックネームの設定
    /// </summary>
    cProbePlayerModel.prototype.setNick = function(argNick)
    {
        this.Nick = argNick;
        this.Monitor.setName(argNick);
    }

    /// <summary>
    /// ディールの開始
    /// </summary>
    cProbePlayerModel.prototype.onStartDeal = function()
    {
        this.Cardslot.reset();
        this.View.showCard(null);
        this.Monitor.showCard(null);
        this.Monitor.showHandName(null, null);
        this.setWinRate(null);
        this.ActedInRound = false;
        this.Reactionable = false;
        this.setPlayerAction(PokerConst.PlayerAction.None);
        this.PreflopFirstActionRecorded = false;

        if (!ns.Engine.ProbeManager.ExcludeFromStats)
        {
            this.Stats.commit(this.HandFlags);
        }
    }

    cProbePlayerModel.prototype.onStartNextBettingRound = function()
    {
        this.ActedInRound = false;
        this.Reactionable = false;
        switch (this.LastAction) {
            case PokerConst.PlayerAction.Check:
            case PokerConst.PlayerAction.Bet:
            case PokerConst.PlayerAction.Call:
            case PokerConst.PlayerAction.Raise:
                this.setPlayerAction(PokerConst.PlayerAction.None);
                break;

            case PokerConst.PlayerAction.None:
            case PokerConst.PlayerAction.Fold:
            case PokerConst.PlayerAction.AllIn:
            default:
                break;
        }
    }

    /// <summary>
    /// ベッティングラウンド開始時のフラグリセット（アクション表示は変更しない）
    /// </summary>
    cProbePlayerModel.prototype.onStartBettingRound = function()
    {
        this.ActedInRound = false;
        this.Reactionable = false;
    }

    /// <summary>
    /// プレイヤーアクションの設定
    /// </summary>
    cProbePlayerModel.prototype.setPlayerAction = function(argPlayerAction)
    {
        this.LastAction = argPlayerAction;
        this.View.showPlayerAction(this.LastAction);
        if (argPlayerAction == PokerConst.PlayerAction.Bet ||
            argPlayerAction == PokerConst.PlayerAction.Raise)
        {
            const label = ns.Engine.ProbeManager.getBetStageLabel();
            this.Monitor.showPlayerAction(this.LastAction, label);
        }
        else
        {
            this.Monitor.showPlayerAction(this.LastAction);
        }

        ns.Engine.ProbeManager.updateWinRate();
    }

    /// <summary>
    /// 勝率の設定
    /// </summary>
    cProbePlayerModel.prototype.setWinRate = function(argWinRate)
    {
        this.Monitor.showWinRate(argWinRate);
    }

    /// <summary>
    /// Alive 属性の反転
    /// </summary>
    cProbePlayerModel.prototype.toggleAlive = function(argValue)
    {
        if(this.Alive)
        {
            this.setAlive(false);
        }
        else
        {
            this.setAlive(true);
        }
    }

    /// <summary>
    /// Alive 属性の設定
    /// </summary>
    cProbePlayerModel.prototype.setAlive = function(argAlive)
    {
        const oldAlive = this.Alive;
        if(argAlive)
        {
            this.Alive = argAlive;
            this.View.toAlive();
            this.Monitor.toAlive();
        }
        else
        {
            this.Alive = argAlive;
            this.View.toDead();
            this.Monitor.toDead();
            if (ns.Engine.ProbeManager.ActionPlayer === this)
            {
                ns.Engine.ProbeManager.resetActionPlayer();
            }
        }
        if(oldAlive !== this.Alive)
        {
            ns.Engine.ProbeManager.updateDealerDisplayState();
        }
    }

    /// <summary>
    /// アクティブなプレイヤーかどうか
    /// </summary>
    cProbePlayerModel.prototype.isActive = function()
    {
        if(this.Alive == false)
        {
            return false;
        }
        switch (this.LastAction) {
            case PokerConst.PlayerAction.Check:
            case PokerConst.PlayerAction.Bet:
            case PokerConst.PlayerAction.Call:
            case PokerConst.PlayerAction.Raise:
            case PokerConst.PlayerAction.None:
            case PokerConst.PlayerAction.AllIn:
                return true;
            case PokerConst.PlayerAction.Fold:
            default:
                return false;
        }
    }
    

    /// <summary>
    /// アクション可能かどうかの判定
    /// </summary>
    cProbePlayerModel.prototype.isActionable = function()
    {
        if (!this.Alive) return false;
        if (this.LastAction == PokerConst.PlayerAction.Fold) return false;
        if (this.LastAction == PokerConst.PlayerAction.AllIn) return false;
        if (this.ActedInRound && !this.Reactionable) return false;
        return true;
    }

    /// <summary>
    /// アグレッシブアクションを選択済みかどうかの判定
    /// </summary>
    cProbePlayerModel.prototype.hasSelectedAggressiveAction = function()
    {
        return this.LastAction == PokerConst.PlayerAction.Bet ||
               this.LastAction == PokerConst.PlayerAction.Raise;
    }


    /// <summary>
    /// アクション中かどうかの設定
    /// </summary>
    cProbePlayerModel.prototype.setActing = function(argActing)
    {
        this.View.setActing(argActing);
        this.Monitor.setActing(argActing);
    }

    /// <summary>
    /// ポジションの設定
    /// </summary>
    cProbePlayerModel.prototype.setPosition = function(argPositionName)
    {
        this.Position = argPositionName;
        this.View.showPosition(argPositionName);
        this.Monitor.setPosition(argPositionName);
    }

    /// <summary>
    /// プローブからのデータ受け取り
    /// </summary>
    cProbePlayerModel.prototype.notifiedFromProbe = function(argValue)
    {
        // 基本情報
        this.setStatus(true);
        this.setBattery(argValue.battery);
        this.setCharging(argValue.charging !== undefined ? argValue.charging : null);
        this.View.updateLastupdateTime();

        // モードに合わせた対応
        switch(argValue.mode)
        {
            case "scan":
                {
                    const well_read = this.Cardslot.scan(argValue);
                    const cards = this.Cardslot.estimate();
                    this.View.showCard(cards);
                    this.Monitor.showCard(cards);
                    ns.Engine.ProbeManager.updateWinRate();
                    ns.Engine.ProbeManager.updateDealerDisplayState();
                    if(well_read)
                    {
                        this.Cardslot.fix();
                        ns.Engine.ProbeManager.updateWinRate();
                        ns.Engine.ProbeManager.updateDealerDisplayState();
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
        this.Monitor.showCard(null);
        ns.Engine.ProbeManager.updateDealerDisplayState();
        ns.Engine.ProbeDeviceManager.writeStartScan(this.Name);
    }

    /// <summary>
    /// View への表示
    /// </summary>
    cProbePlayerModel.prototype.showView = function()
    {
        this.setAlive(this.Alive);
        this.View.showName(this.Name);
    }

    /// <summary>
    /// プリフロップ開始時の処理（ハンド数のカウントアップ）
    /// </summary>
    cProbePlayerModel.prototype.onPreflopStart = function()
    {
        if (!ns.Engine.ProbeManager.ExcludeFromStats)
        {
            this.Stats.handCount++;
        }
        this.HandFlags = new ns.HandStatsFlags();
    }

    /// <summary>
    /// VPIP カウントの加算（同一ハンド内での重複加算を防ぐ）
    /// </summary>
    cProbePlayerModel.prototype.incrementVpipCount = function()
    {
        this.HandFlags.hasVpipedThisHand = true;
    }

    /// <summary>
    /// PFR カウントの加算（同一ハンド内での重複加算を防ぐ）
    /// </summary>
    cProbePlayerModel.prototype.incrementPfrCount = function()
    {
        this.HandFlags.hasPreflopRaisedThisHand = true;
    }

    /// <summary>
    /// 3bet opportunity のマーク（同一ハンド内での重複マークを防ぐ）
    /// </summary>
    cProbePlayerModel.prototype.markThreeBetOpportunity = function()
    {
        this.HandFlags.hadThreeBetOpportunityThisHand = true;
    }

    /// <summary>
    /// 3bet カウントの加算（同一ハンド内での重複加算を防ぐ）
    /// </summary>
    cProbePlayerModel.prototype.incrementThreeBetCount = function()
    {
        this.HandFlags.hasThreeBetThisHand = true;
    }

    /// <summary>
    /// 統計情報の取得
    /// </summary>
    cProbePlayerModel.prototype.getStats = function()
    {
        return this.Stats;
    }

    /// <summary>
    /// JSON からプレイヤー統計を復元する
    /// </summary>
    cProbePlayerModel.prototype.applyStatsFromJson = function(json)
    {
        const s = json.PlayerStats;
        this.Stats.handCount             = s.handCount;
        this.Stats.vpipHands             = s.vpipHands;
        this.Stats.pfrHands              = s.pfrHands;
        this.Stats.threeBetHands         = s.threeBetHands;
        this.Stats.threeBetOpportunities = s.threeBetOpportunities;
        if (json.HandRange && typeof json.HandRange === "object")
        {
            const hr = json.HandRange;
            if (Object.prototype.hasOwnProperty.call(hr, "Stats"))
            {
                // v3 新フォーマット: { Stats, History }
                this.HandRange.Stats   = JSON.parse(JSON.stringify(hr.Stats   || {}));
                this.HandRange.History = JSON.parse(JSON.stringify(hr.History || []));
            }
            else
            {
                // v2 旧フォーマット: フラットな Stats マップ
                this.HandRange.Stats   = JSON.parse(JSON.stringify(hr));
                this.HandRange.History = [];
            }
        }
        else
        {
            this.HandRange.Stats   = {};
            this.HandRange.History = [];
        }

        // playerName を更新（monitor_screen 側の名前表示も更新される）
        this.setNick(json.playerName);
        // probe パネルの nick input の値も更新
        this.View.NickInput.value = json.playerName;

        // 統計表示モードが有効な場合は表示を更新
        if (this.Monitor.StatsGroup.style.display !== "none")
        {
            this.Monitor.showStatsMode(this.Stats, this.HandRange);
        }
    }

    /// <summary>
    /// プリフロップ初手アクションをハンドレンジ統計に記録する（同一ハンド内での重複記録を防ぐ）
    /// </summary>
    cProbePlayerModel.prototype.recordPreflopFirstAction = function(argCards, argAction)
    {
        if (this.PreflopFirstActionRecorded) return;
        if (!argCards || argCards.length < 2) return;

        this.PreflopFirstActionRecorded = true;
        this.HandRange.record(argCards[0], argCards[1], argAction);
    }

    ns.cProbePlayerModel = cProbePlayerModel;
})(Monitor = Monitor || {});
