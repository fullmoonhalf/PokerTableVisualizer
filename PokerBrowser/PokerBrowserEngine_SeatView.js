(function (ns) {
    "use strict";
    if(ns.cSeatView) return;

	// =====================================================================
	// プローブの表示まわり
	// =====================================================================
	function cSeatView(argSeatName, argSeatControlViewElement, argSeatLiveViewElemwent)
	{
		this.SeatControl = new ns.cSeatControlView(this, argSeatControlViewElement);
		this.SeatLive = new ns.cSeatLiveView(argSeatLiveViewElemwent);
		this.Active = true;
		this.Alive = false;
		this.AllIn = false;
		this.PositionIndex = 0; // ディーラーまでの人数
		this.AlivePlayerCount = 0;
		this.Round = PokerConst.BettingRound.Invalid;
		this.PlayerName = "";
		this.CurrentHoleCards = [];
		this.HandStartChip = 0;

		this.setSeatName(argSeatName);
		this.toDead();
	}

	// ---------------------------------------------------------------------
	// 
	// ---------------------------------------------------------------------
	// フォールド
	cSeatView.prototype.onCommandActivityFold = function(event)
	{
		if(this.Active)
		{
			this.toFold();
		}
		else
		{
			this.toActive();
		}
	}
	// ボタンをこのシートに設定する
	cSeatView.prototype.onCommandPosition = function(event)
	{
		PokerBrowser.engine.setButton(this.SeatName);
	}
	// 生死
	cSeatView.prototype.onCommandAlive = function(event)
	{
		if(this.Alive)
		{
			this.toDead();
		}
		else
		{
			this.toAlive();
		}
	}
	// オールイン
	cSeatView.prototype.onCommandAllIn = function(event)
	{
		if(this.AllIn)
		{
			this.leaveAnnIn();
		}
		else
		{
			this.enterAllIn();
		}
	}
	// 名前入力イベントの処理
	cSeatView.prototype.onInputName = function(event)
	{
		this.SeatLive.setName(event.target.value);
	}

	// ---------------------------------------------------------------------
	// 
	// ---------------------------------------------------------------------
	cSeatView.prototype.toDealed = function()
	{
		if(this.Alive)
		{
			this.CurrentHoleCards = [];
			this.SeatControl.toDealed();
			this.SeatLive.toDealed();
			this.HandStartChip = this.SeatControl.getStack();
			this.SeatLive.setStack(this.SeatControl.getStack());
		}
	}
	cSeatView.prototype.toFold = function()
	{
		if(this.Alive)
		{
			this.Active = false;
			this.SeatControl.toFold();
			this.SeatLive.toFold();
			PokerBrowser.engine.broadcastWinrate();
		}
	}
	cSeatView.prototype.toActive = function()
	{
		if(this.Alive)
		{
			this.Active = true;
			this.SeatControl.toActive();
			this.SeatLive.toActive();
			PokerBrowser.engine.broadcastWinrate();
		}
	}
	cSeatView.prototype.toDead = function()
	{
		this.Alive = false;
		this.AllIn = false;
		this.SeatControl.toDead();
		this.SeatLive.toDead();
		PokerBrowser.engine.broadcastWinrate();
	}
	cSeatView.prototype.toAlive = function()
	{
		this.Alive = true;
		this.AllIn = false;
		this.SeatControl.toAlive();
		this.SeatLive.toAlive();
		PokerBrowser.engine.broadcastWinrate();
	}
	cSeatView.prototype.enterAllIn = function()
	{
		this.AllIn = true;
		this.SeatControl.enterAllIn();
		this.SeatLive.enterAllIn();
	}
	cSeatView.prototype.leaveAnnIn = function()
	{
		this.AllIn = false;
		this.SeatControl.leaveAnnIn();
		this.SeatLive.leaveAnnIn();
	}
	// ---------------------------------------------------------------------
	// 状態の取得
	// ---------------------------------------------------------------------
	cSeatView.prototype.isAlive = function()
	{
		return this.Alive == true;
	}
	cSeatView.prototype.isActive = function()
	{
		return this.Alive == true && this.Active == true;
	}
	cSeatView.prototype.getScanCount = function()
	{
		return 2;
	}
	// プレイヤー名を取得する
	cSeatView.prototype.getPlayerName = function()
	{
		return this.PlayerName;
	}
	// スタックを取得する
	cSeatView.prototype.getStack = function()
	{
		return this.SeatControl.getStack();
	}
	// ベッティング量を取得する
	cSeatView.prototype.getBetAmount = function()
	{

	}
	// BB かどうか
	cSeatView.prototype.isBB = function()
	{
		const position_name = ns.convertPositionName(this.AlivePlayerCount, this.PositionIndex);
		return position_name == ns.POKER_POSITION_BB;
	}
	// SB かどうか
	cSeatView.prototype.isSB = function()
	{
		const position_name = ns.convertPositionName(this.AlivePlayerCount, this.PositionIndex);
		if(position_name == ns.POKER_POSITION_SB)
		{
			return true;
		}
		if(this.AlivePlayerCount == 2 && position_name == ns.POKER_POSITION_DEALER)
		{
			return true;
		}
		return false;
	}
	// ---------------------------------------------------------------------
	// 状態の設定
	// ---------------------------------------------------------------------
	cSeatView.prototype.setSeatName = function(argSeatName)
	{
		this.SeatName = argSeatName;
		this.SeatControl.setSeatName(argSeatName);
		this.SeatLive.setName(argSeatName);
		if(!this.PlayerName)
		{
			this.PlayerName = argSeatName;
		}
	}
	cSeatView.prototype.setRSSI = function(argRSSI)
	{
		this.SeatControl.setRSSI(argRSSI);
	}
	cSeatView.prototype.setBattery = function(argBattery)
	{
		this.SeatControl.setBattery(argBattery);
	}
	cSeatView.prototype.setHoleCards = function(argHoleCards)
	{
		if(this.Round == PokerConst.BettingRound.DealHand)
		{
			const disp_hole_cards = argHoleCards.sort((a, b) => ns.getCardOrder[a] - ns.getCardOrder[b]);
			this.SeatControl.setHoleCards(disp_hole_cards);
			this.SeatLive.setHoleCards(disp_hole_cards);
			this.CurrentHoleCards = disp_hole_cards;
		}
	}
	cSeatView.prototype.setPosition = function(argPositionIndex, argAlivePlayerCount)
	{
		this.PositionIndex = argPositionIndex;
		this.AlivePlayerCount = argAlivePlayerCount;
		this.SeatControl.setPosition(argPositionIndex, argAlivePlayerCount);
		this.SeatLive.setPosition(argPositionIndex, argAlivePlayerCount);
	}
	cSeatView.prototype.setRound = function(argRound)
	{
		this.Round = argRound;
		switch(this.Round)
		{
			case PokerConst.BettingRound.Preflop:
				PokerModel.useHoleCards(this.PlayerName, this.CurrentHoleCards);
				break;
		}
	}
	cSeatView.prototype.setWinRate = function(argWinRate)
	{
		this.SeatLive.setWinRate(argWinRate);
	}
	cSeatView.prototype.postBlind = function(argAmount)
	{
		const actual_amount = this.SeatControl.setBetAmount(argAmount);
		this.SeatLive.setStack(this.SeatControl.getStack());
		this.SeatLive.setAction("Blind", this.SeatControl.getBetAmount());
		return actual_amount;
	}
	cSeatView.prototype.postAnti = function(argAmount)
	{
		const actual_amount = this.SeatControl.postAnti(argAmount);
		this.SeatLive.setStack(this.SeatControl.getStack());
		return actual_amount;
	}

    ns.cSeatView = cSeatView

})(PokerBrowser = PokerBrowser || {});
