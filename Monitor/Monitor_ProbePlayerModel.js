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
        this.setWinRate(null);
        this.ActedInRound = false;
        this.Reactionable = false;
        this.setPlayerAction(PokerConst.PlayerAction.None);
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
        this.Monitor.showPlayerAction(this.LastAction);
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
                    if(well_read)
                    {
                        this.Cardslot.fix();
                        ns.Engine.ProbeManager.updateWinRate();
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

    ns.cProbePlayerModel = cProbePlayerModel;
})(Monitor = Monitor || {});
