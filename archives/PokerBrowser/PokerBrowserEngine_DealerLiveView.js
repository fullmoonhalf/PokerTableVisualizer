(function (ns) {
    "use strict";
    if(ns.cDealerLiveView) return;

	const TEMPLATE_DEALER_VIEW_DRAG = "template_panel_dealer_view_drag";
	const TEMPLATE_DEALER_VIEW_BOARD_FLOP = "template_panel_dealer_view_flop";
	const TEMPLATE_DEALER_VIEW_BOARD_TURN = "template_panel_dealer_view_turn";
	const TEMPLATE_DEALER_VIEW_BOARD_RIVER = "template_panel_dealer_view_river";
	const TEMPLATE_DEALER_VIEW_BLIND_VALUE = "template_panel_dealer_view_blind_value";
	const TEMPLATE_DEALER_VIEW_POT_VALUE = "template_panel_dealer_view_pot_value";
	const TEMPLATE_DEALER_VIEW_POT_LABEL = "template_panel_dealer_view_pot_label";
	const TEMPLATE_DEALER_VIEW_POT_GROUP = "template_panel_dealer_view_pot_group";

    // =====================================================================
	// Dealer 表示オブジェクト
	// =====================================================================
	function cDealerLiveView(argBaseElement)
	{
		this.ElementBase = argBaseElement;
		this.ElementDrag = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_DRAG); 
		this.ElementBoardFlop = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_BOARD_FLOP);
		this.ElementBoardTurn = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_BOARD_TURN);
		this.ElementBoardRiver = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_BOARD_RIVER);
		this.DragControl = new ns.cDragableElement(this.ElementDrag);
		this.ElementBlindValue = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_BLIND_VALUE, "");
		this.ElementPotValue = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_POT_VALUE, "0");
		this.ElementPotLabel = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_POT_LABEL);
		this.ElementPotGroup = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_POT_GROUP);
	}
	cDealerLiveView.prototype.setBoardFlop = function(argCards)
	{
		this.ElementBoardFlop.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 3);
	}
	cDealerLiveView.prototype.setBoardTurn = function(argCards)
	{
		this.ElementBoardTurn.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 1);
	}
	cDealerLiveView.prototype.setBoardRiver = function(argCards)
	{
		this.ElementBoardRiver.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 1);
	}
	cDealerLiveView.prototype.setPot = function(argPot)
	{
		this.ElementPotGroup.classList.toggle("disable", argPot == 0);
		this.ElementPotValue.innerHTML = argPot;
	}
	cDealerLiveView.prototype.setBlind = function(argBlind)
	{
		this.ElementBlindValue.innerHTML = `${argBlind.sb}/${argBlind.bb}`;
	}

    ns.cDealerLiveView = cDealerLiveView;

})(PokerBrowser = PokerBrowser || {});
