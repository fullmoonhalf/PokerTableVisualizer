(function (ns) {
    "use strict";
    if(ns.cDealerControlView) return;

	const TEMPLATE_DEALER_CONTROL_HAND = "template_panel_dealer_probe_hand";
	const TEMPLATE_DEALER_CONTROL_ROUND = "template_panel_dealer_probe_round";
	const TEMPLATE_DEALER_CONTROL_BOARD_FLOP = "template_panel_dealer_probe_flop";
	const TEMPLATE_DEALER_CONTROL_BOARD_TURN = "template_panel_dealer_probe_turn";
	const TEMPLATE_DEALER_CONTROL_BOARD_RIVER = "template_panel_dealer_probe_river";
	const TEMPLATE_DEALER_CONTROL_RSSI = "template_panel_dealer_probe_rssi";
	const TEMPLATE_DEALER_CONTROL_Battery = "template_panel_dealer_probe_battery";
	const TEMPLATE_DEALER_CONTROL_SB_INPUT = "template_panel_dealer_probe_sb_input";
	const TEMPLATE_DEALER_CONTROL_BB_INPUT = "template_panel_dealer_probe_bb_input";
	const TEMPLATE_DEALER_CONTROL_POT_INPUT = "template_panel_dealer_probe_pot_input";

    // =====================================================================
	// Dealer 制御オブジェクト
	// =====================================================================
	function cDealerControlView(argBaseElement)
	{
		this.ElementBase = argBaseElement;
		this.ElementHand = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_HAND, "");
		this.ElementRound = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_ROUND, "");
		this.ElementBoardFlop = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_BOARD_FLOP);
		this.ElementBoardTurn = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_BOARD_TURN);
		this.ElementBoardRiver = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_BOARD_RIVER);
		this.ElementRssi = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_RSSI, "");
		this.ElementBattery = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_Battery, "");
		this.InputSB = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_SB_INPUT);
		this.InputBB = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_BB_INPUT);
		this.InputPot = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_POT_INPUT);
	}
	cDealerControlView.prototype.setRound = function(argRound)
	{
		switch(argRound)
		{
			case PokerConst.BettingRound.DealHand:
				this.ElementRound.innerHTML = "Preflop(deal)";
				break;
			case PokerConst.BettingRound.Preflop:
				this.ElementRound.innerHTML = "Preflop";
				break;
			case PokerConst.BettingRound.Flop:
				this.ElementRound.innerHTML = "Flop";
				break;
			case PokerConst.BettingRound.Turn:
				this.ElementRound.innerHTML = "Turn";
				break;
			case PokerConst.BettingRound.River:
				this.ElementRound.innerHTML = "River";
				break;
			case PokerConst.BettingRound.EndHand:
				this.ElementRound.innerHTML = "End";
				break;
		}
	}
	cDealerControlView.prototype.setRSSI = function(argRSSI)
	{
		this.ElementRssi.innerHTML = ns.convertRSSIExpression(argRSSI);
	}
	cDealerControlView.prototype.setBattery = function(argBattery)
	{
		this.ElementBattery.innerHTML = ns.convertBatteryExpression(argBattery);
	}
	cDealerControlView.prototype.setHandCount = function(argHandCount)
	{
		this.ElementHand.innerHTML = `Hand: ${argHandCount}`;
	}

    // ---------------------------------------------------------------------
	// ボード関連
    // ---------------------------------------------------------------------
    cDealerControlView.prototype.setBoardFlop = function(argCards)
	{
		this.ElementBoardFlop.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 3);
	}
	cDealerControlView.prototype.setBoardTurn = function(argCards)
	{
		this.ElementBoardTurn.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 1);
	}
	cDealerControlView.prototype.setBoardRiver = function(argCards)
	{
		this.ElementBoardRiver.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 1);
	}

    // ---------------------------------------------------------------------
	// ポット関連
    // ---------------------------------------------------------------------
    cDealerControlView.prototype.addPot = function(argChip)
	{
		let pot = this.getPot();
		pot += argChip;
		this.setPot(pot);
	}
	cDealerControlView.prototype.getPot = function()
	{
		return Number(this.InputPot.value) || 0;
	}
	cDealerControlView.prototype.setPot = function(argChip)
	{
		this.InputPot.value = argChip;
	}

    // ---------------------------------------------------------------------
	// ブラインド関連
    // ---------------------------------------------------------------------
    cDealerControlView.prototype.getBlind = function()
	{
		let sb = Number(this.InputSB.value) || 0;
		let bb = Number(this.InputBB.value) || 0;
		return {"sb":sb, "bb":bb};
	}
    cDealerControlView.prototype.setBlind = function(argSB, argBB)
    {
        this.InputSB.value = Number(argSB) || 0;
        this.InputBB.value = Number(argBB) || 0;
    }


    ns.cDealerControlView = cDealerControlView;
})(PokerBrowser = PokerBrowser || {});
