(function (ns) {
    "use strict";
    if(ns.cSeatView) return;

	// =====================================================================
	// プローブの表示まわり
	// =====================================================================
	function cSeatView(argSeatName, argSeatControlViewElement, argSeatLiveViewElemwent)
	{
		// 管理オブジェクト
		this.SeatControl = new ns.cSeatControlView(this, argSeatControlViewElement);
		this.SeatLive = new ns.cSeatLiveView(argSeatLiveViewElemwent);
		this.NextSeat = null;
		this.ActionReceiver = null;

		// シートの状態
		this.Alive = true; // toDead を通すために true で初期化
		this.PlayerName = "";

		// ポジションやアクション
		this.PositionIndex = 0; // ディーラーまでの人数
		this.AlivePlayerCount = 0;
		this.CurrentActor = false;

		// ハンドごとの状態
		this.Active = true;
		this.AllIn = false;
		this.Round = PokerConst.BettingRound.Invalid;
		this.CurrentHoleCards = [];
		this.HandStartChip = 0;

		// 通知などして整合性をとる
		this.setSeatName(argSeatName);
		this.toDead();
	}
	// ---------------------------------------------------------------------
	// 基本構造
	// ---------------------------------------------------------------------
	// 次のシートを設定する
	cSeatView.prototype.setNextSeat = function(argNextSeat)
	{
		this.NextSeat = argNextSeat;
	}
	// 次のシートを取得する
	cSeatView.prototype.getNextSeat = function()
	{
		return this.NextSeat;
	}
	// アクションレシーバー
	cSeatView.prototype.setActionReceiver = function(argReceiver)
	{
		this.ActionReceiver = argReceiver;
	}

	// ---------------------------------------------------------------------
	// コマンド処理
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
	// フォールド
	cSeatView.prototype.onCommandActivityCall = function(event)
	{
		if(this.Active)
		{
			this.toCall();
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


	// ボタンをこのシートに設定する
	cSeatView.prototype.onCommandPosition = function(event)
	{
		this.ActionReceiver?.setButton(this);
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
			this.toActive();
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
			this.ActionReceiver?.notifySeatFold(this);
		}
	}
	cSeatView.prototype.toCall = function()
	{
		if(this.Alive)
		{
			this.ActionReceiver?.notifySeatCall(this);
		}
	}


	cSeatView.prototype.toActive = function()
	{
		if(this.Alive)
		{
			this.Active = true;
			this.SeatControl.toActive();
			this.SeatLive.toActive();
		}
	}
	cSeatView.prototype.toDead = function()
	{
		if(this.Alive)
		{
			this.Alive = false;
			this.AllIn = false;
			this.SeatControl.toDead();
			this.SeatLive.toDead();
			this.ActionReceiver?.notifySeatOpen(this);
		}
	}
	cSeatView.prototype.toAlive = function()
	{
		if(!this.Alive)
		{
			this.Alive = true;
			this.AllIn = false;
			this.SeatControl.toAlive();
			this.SeatLive.toAlive();
			this.ActionReceiver?.notifySeatEntry(this);
		}
	}
	cSeatView.prototype.enterAllIn = function()
	{
		if(!this.AllIn)
		{
			this.AllIn = true;
			this.SeatControl.enterAllIn();
			this.SeatLive.enterAllIn();
			this.ActionReceiver?.notifySeatAllin(this);
		}
	}
	cSeatView.prototype.leaveAnnIn = function()
	{
		if(this.AllIn)
		{
			this.AllIn = false;
			this.SeatControl.leaveAnnIn();
			this.SeatLive.leaveAnnIn();
		}
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

	// ---------------------------------------------------------------------
	// プローブまわりの管理
	// ---------------------------------------------------------------------
	cSeatView.prototype.getScanCount = function()
	{
		return 2;
	}
	cSeatView.prototype.setRSSI = function(argRSSI)
	{
		this.SeatControl.setRSSI(argRSSI);
	}
	cSeatView.prototype.setBattery = function(argBattery)
	{
		this.SeatControl.setBattery(argBattery);
	}

	// ---------------------------------------------------------------------
	// 名前管理
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
	// プレイヤー名を取得する
	cSeatView.prototype.getPlayerName = function()
	{
		return this.PlayerName;
	}

	// ---------------------------------------------------------------------
	// ゲーム状況
	// ---------------------------------------------------------------------
	cSeatView.prototype.setRound = function(argRound)
	{
		this.Round = argRound;
		switch(this.Round)
		{
			case PokerConst.BettingRound.DealHand:
				this.toDealed();
				break;
			case PokerConst.BettingRound.Preflop:
				PokerModel.useHoleCards(this.PlayerName, this.CurrentHoleCards);
				break;
			case PokerConst.BettingRound.Flop:
			case PokerConst.BettingRound.Turn:
			case PokerConst.BettingRound.River:
				this.SeatControl.resetBetAmount();
				this.SeatLive.resetAction();
				break;
			}
	}
	cSeatView.prototype.setWinRate = function(argWinRate)
	{
		this.SeatLive.setWinRate(argWinRate);
	}

	// ---------------------------------------------------------------------
	// ポジション関連
	// ---------------------------------------------------------------------
	cSeatView.prototype.setPosition = function(argPositionIndex, argAlivePlayerCount)
	{
		this.PositionIndex = argPositionIndex;
		this.AlivePlayerCount = argAlivePlayerCount;
		this.SeatControl.setPosition(argPositionIndex, argAlivePlayerCount);
		this.SeatLive.setPosition(argPositionIndex, argAlivePlayerCount);
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
	// プリフロップ時の一番最初のプレイヤー
	cSeatView.prototype.isFirstActorInPreflop = function()
	{
		const position_name = ns.convertPositionName(this.AlivePlayerCount, this.PositionIndex);
		if(position_name == ns.POKER_POSITION_UTG)
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
	// アクター処理
	// ---------------------------------------------------------------------
	// カレントアクタに設定する
	cSeatView.prototype.setCurrentActor = function()
	{
		this.CurrentActor = true;
		this.SeatControl.setCurrentActor();
		this.SeatLive.setCurrentActor();
	}
	// カレントアクタからリセット
	cSeatView.prototype.resetCurrentActor = function()
	{
		this.CurrentActor = false;
		this.SeatControl.resetCurrentActor();
		this.SeatLive.resetCurrentActor();
	}
	// カレントアクタかどうかを調べる
	cSeatView.prototype.isCurrentActor = function()
	{
		return this.CurrentActor;
	}

	// ---------------------------------------------------------------------
	// ホールカード
	// ---------------------------------------------------------------------
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

	// ---------------------------------------------------------------------
	// スタック管理
	// ---------------------------------------------------------------------
	// スタックを取得する
	cSeatView.prototype.getStack = function()
	{
		return this.SeatControl.getStack();
	}
	// スタックを設定する
	cSeatView.prototype.setStack = function(argStack)
	{
		this.SeatControl.setStack(argStack);
		this.SeatLive.setStack(argStack);
	}
	// スタックを追加する
	cSeatView.prototype.addStack = function(argAmount)
	{
		let stack = this.getStack();
		stack += argAmount;
		this.setStack(stack);
		this.SeatLive.setAction("Win", argAmount);
	}
	// ベッティング量を取得する
	cSeatView.prototype.getBetAmount = function()
	{
		return this.SeatControl.getBetAmount();
	}
	// ベット額の追加
	cSeatView.prototype.addBetAmount = function(argAction, argAmount)
	{
		// ベット(追加)にともなうスタック変化を計算
		const previous_stack = this.getStack();
		const actual_amount = Math.min(previous_stack, argAmount);
		const current_stack = previous_stack - actual_amount;
		const current_bet = this.getBetAmount() + actual_amount;

		// コントロールに反映
		this.SeatControl.setBetAmount(current_bet);
		this.SeatControl.setStack(current_stack);

		// 表示側に反映
		this.SeatLive.setStack(this.SeatControl.getStack());
		this.SeatLive.setAction(argAction, this.SeatControl.getBetAmount());

		return actual_amount;
	}
	// ブラインドの強制ベット
	cSeatView.prototype.postBlind = function(argAmount)
	{
		// ブラインド支払いにともなうスタック変化を計算
		const previous_stack = this.getStack();
		const actual_amount = Math.min(previous_stack, argAmount);
		const current_stack = previous_stack - actual_amount;

		// コントロールに反映
		this.SeatControl.setBetAmount(actual_amount);
		this.SeatControl.setStack(current_stack);

		// 表示側に反映
		this.SeatLive.setStack(this.SeatControl.getStack());
		this.SeatLive.setAction("Blind", this.SeatControl.getBetAmount());

		return actual_amount;
	}
	// アンティの支払い
	cSeatView.prototype.postAnti = function(argAmount)
	{
		// ブラインド支払いにともなうスタック変化を計算
		const previous_stack = this.getStack();
		const actual_amount = Math.min(previous_stack, argAmount);
		const current_stack = previous_stack - actual_amount;

		// コントロールに反映
		this.SeatControl.setStack(current_stack);

		// 表示側に反映
		this.SeatLive.setStack(this.SeatControl.getStack());
		
		return actual_amount;
	}


	// ---------------------------------------------------------------------
	// コンストラクタの公開
	// ---------------------------------------------------------------------
	ns.cSeatView = cSeatView

})(PokerBrowser = PokerBrowser || {});
