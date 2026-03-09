(function (ns) {
    "use strict";
    if(ns.cDealerView) return;


    // =====================================================================
	// Dealer オブジェクト
	// =====================================================================
	function cDealerView(argControlBaseElement, argLiveBaseElement)
	{
		this.ControlView = new ns.cDealerControlView(argControlBaseElement);
		this.LiveView = new ns.cDealerLiveView(argLiveBaseElement);
		this.Round = PokerConst.BettingRound.Invalid;
		this.BoardFlop = [];
		this.BoardTurn = [];
		this.BoardRiver = [];
		this.SeatName = ns.BLE_DEVICE_PROBE_NAME_DEALER;
		this.CurrentRound = PokerConst.BettingRound.Invalid;
	}
	cDealerView.prototype.setRSSI = function(argRSSI)
	{
		this.ControlView.setRSSI(argRSSI);
	}
	cDealerView.prototype.setBattery = function(argBattery)
	{
		this.ControlView.setBattery(argBattery);
	}
	cDealerView.prototype.getScanCount = function()
	{
		switch(this.CurrentRound)
		{
			case PokerConst.BettingRound.Flop:
				return 3;
			case PokerConst.BettingRound.Turn:
				return 1;
			case PokerConst.BettingRound.River:
				return 1;
			default:
				return 0;
		}
	}
	cDealerView.prototype.toDealed = function()
	{
		this.BoardFlop = [];
		this.BoardTurn = [];
		this.BoardRiver = [];
		this.ControlView.setBoardFlop([]);
		this.LiveView.setBoardFlop([]);
		this.ControlView.setBoardTurn([]);
		this.LiveView.setBoardTurn([]);
		this.ControlView.setBoardRiver([]);
		this.LiveView.setBoardRiver([]);
		this.LiveView.setBlind(this.ControlView.getBlind());
	}

    // ---------------------------------------------------------------------
	// 状況関連
    // ---------------------------------------------------------------------
	cDealerView.prototype.setHandCount = function(argHandCount)
	{
		this.ControlView.setHandCount(argHandCount);
	}
	cDealerView.prototype.setRound = function(argRound)
	{
		this.CurrentRound = argRound;
		this.ControlView.setRound(argRound);
		switch(this.CurrentRound)
		{
			case PokerConst.BettingRound.DealHand:
				{
					const blind = this.getBlind();
					this.setToCallAmount(blind.bb);
					this.setMinimumRaiseAmount("Minimum raize: ", blind.bb * 2);
					this.toDealed();
				}
				break;
			case PokerConst.BettingRound.Flop:
				{
					const blind = this.getBlind();
					this.setToCallAmount(0);
					this.setMinimumRaiseAmount("To bet: ", blind.bb);
				}
				break;
			case PokerConst.BettingRound.Turn:
				{
					const blind = this.getBlind();
					this.setToCallAmount(0);
					this.setMinimumRaiseAmount("To bet: ", blind.bb);
					PokerModel.useFlopCards(this.BoardFlop);
				}
				break;
			case PokerConst.BettingRound.River:
				{
					const blind = this.getBlind();
					this.setToCallAmount(0);
					this.setMinimumRaiseAmount("To bet: ", blind.bb);
					PokerModel.useTurnCards(this.BoardTurn);
				}
				break;
			case PokerConst.BettingRound.EndHand:
				PokerModel.useRiverCards(this.BoardRiver);
				this.resetPot();
				break;
			default:
				break;
		}
	}
	// 必要コール額の設定
	cDealerView.prototype.setToCallAmount = function(argAmount)
	{
		this.ControlView.setToCallAmount(argAmount);
	}
	// 必要コール額の取得
	cDealerView.prototype.getToCallAmount = function()
	{
		return this.ControlView.getToCallAmount();
	}
	// 必要レイズ額の設定
	cDealerView.prototype.setMinimumRaiseAmount = function(argLabel, argAmount)
	{
		this.ControlView.setMinimumRaiseAmount(argLabel, argAmount);
	}
	// 必要レイズ額の取得
	cDealerView.prototype.getMinimumRaiseAmount = function()
	{
		return this.ControlView.getMinimumRaiseAmount();
	}	

    // ---------------------------------------------------------------------
	// ボード関連
    // ---------------------------------------------------------------------
	cDealerView.prototype.getCurrentCommunityCards = function()
	{
		return this.BoardFlop.concat(this.BoardTurn, this.BoardRiver);
	}
	cDealerView.prototype.setHoleCards = function(argHoleCards)
	{
		const disp_hole_cards = argHoleCards.sort((a, b) => ns.getCardOrder(a) - ns.getCardOrder(b));
		switch(this.CurrentRound)
		{
			case PokerConst.BettingRound.Flop:
				this.BoardFlop = disp_hole_cards;
				this.ControlView.setBoardFlop(disp_hole_cards);
				this.LiveView.setBoardFlop(disp_hole_cards);
				PokerBrowser.engine.broadcastWinrate();
				break;
			case PokerConst.BettingRound.Turn:
				this.BoardTurn = disp_hole_cards;
				this.ControlView.setBoardTurn(disp_hole_cards);
				this.LiveView.setBoardTurn(disp_hole_cards);
				PokerBrowser.engine.broadcastWinrate();
				break;
			case PokerConst.BettingRound.River:
				this.BoardRiver = disp_hole_cards;
				this.ControlView.setBoardRiver(disp_hole_cards);
				this.LiveView.setBoardRiver(disp_hole_cards);
				PokerBrowser.engine.broadcastWinrate();
				break;
			default:
				break;
		}
	}

    // ---------------------------------------------------------------------
	// ポット関連
    // ---------------------------------------------------------------------
	// ポットの追加
	cDealerView.prototype.addPot = function(argChip)
	{
		this.ControlView.addPot(argChip);
		this.LiveView.setPot(this.ControlView.getPot());
	}
	// ポットの取得
	cDealerView.prototype.getPot = function()
	{
		return this.ControlView.getPot();
	}
	// ポットのリセット
	cDealerView.prototype.resetPot = function()
	{
		this.ControlView.setPot(0);
		this.LiveView.setPot(0);
	}

    // ---------------------------------------------------------------------
	// ブラインド関連
    // ---------------------------------------------------------------------
	// ブラインドの取得
	cDealerView.prototype.getBlind = function()
	{
		return this.ControlView.getBlind();
	}

    // ブラインドの設定
    cDealerView.prototype.setBlind = function(argSB, argBB)
    {
        this.ControlView.setBlind(argSB, argBB);
		this.LiveView.setBlind(this.ControlView.getBlind());
    }




    ns.cDealerView = cDealerView;
})(PokerBrowser = PokerBrowser || {});
