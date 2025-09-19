(function (ns) {
    "use strict";
    if(ns.cSeatLiveView) return;

	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_NAME = "template_panel_user_current_hand_value_name";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_POSITION = "template_panel_user_current_hand_value_position";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_WINRATE = "template_panel_user_current_hand_value_winrate";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_HAND = "template_panel_user_current_hand_value_hand";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_ACTION = "template_panel_user_current_hand_label_bet";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_BETAMOUNT = "template_panel_user_current_hand_value_bet";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_STACK = "template_panel_user_current_hand_value_stack";
	const TEMPLATE_PANEL_PROBE_DRAG = "template_panel_user_current_hand_drag";
	const TEMPLATE_PANEL_PROBE_INFOS = "template_panel_user_current_hand_infos";

    // =====================================================================
	// 中継表示側
	// =====================================================================
	function cSeatLiveView(argElementBase)
	{
		this.ElementBase = argElementBase; 
		this.ElementDrag = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_DRAG); 
		this.ElementInfos = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_INFOS);
		this.ElementName = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_NAME);
		this.ElementPosition = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_POSITION, "");
		this.ElementWinRate = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_WINRATE, "");
		this.ElementHand = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_HAND);
		this.DragControl = new ns.cDragableElement(this.ElementDrag);
		this.ElementAction = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_ACTION, "");
		this.ElementBetAmount = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_BETAMOUNT, "");
		this.ElementStack = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_STACK, "");
	}
	cSeatLiveView.prototype.setName = function(argName)
	{
		this.ElementName.innerHTML = argName;
	}
	cSeatLiveView.prototype.setPosition = function(argPositionIndex, argAlivePlayerCount)
	{
		const position_name = ns.convertPositionName(argAlivePlayerCount, argPositionIndex);
		this.ElementPosition.innerHTML = position_name;
	}
	cSeatLiveView.prototype.toDealed = function()
	{
		this.leaveAnnIn();
		this.toActive();
		this.setHoleCards([]);
		this.ElementWinRate.innerHTML= "";
	}
	cSeatLiveView.prototype.toFold = function()
	{
		this.ElementInfos.classList.toggle("fold", true);
		this.ElementName.classList.toggle("fold", true);
		this.ElementHand.classList.toggle("fold", true);
		this.ElementWinRate.innerHTML= "";
	}
	cSeatLiveView.prototype.toActive = function()
	{
		this.ElementInfos.classList.toggle("fold", false);
		this.ElementName.classList.toggle("fold", false);
		this.ElementHand.classList.toggle("fold", false);
	}
	cSeatLiveView.prototype.toDead = function()
	{
		this.ElementBase.classList.toggle("seatopen", true);
		this.ElementWinRate.innerHTML= "";
	}
	cSeatLiveView.prototype.toAlive = function()
	{
		this.ElementBase.classList.toggle("seatopen", false);
	}
	cSeatLiveView.prototype.enterAllIn = function()
	{
		this.ElementInfos.classList.toggle("allin", true);
		this.ElementInfos.classList.toggle("fold", false);
	}
	cSeatLiveView.prototype.leaveAnnIn = function()
	{
		this.ElementInfos.classList.toggle("allin", false);
		this.ElementInfos.classList.toggle("fold", false);
	}
	cSeatLiveView.prototype.setHoleCards = function(argHoleCards)
	{
		this.ElementHand.innerHTML = ns.createHoleCardsHTML(argHoleCards, ns.CLASS_CARD_NORMAL);
	}
	cSeatLiveView.prototype.setWinRate = function(argWinRate)
	{
		this.ElementWinRate.innerHTML= `${argWinRate}%`;
	}
	cSeatLiveView.prototype.setStack = function(argStack)
	{
		this.ElementStack.innerHTML = argStack;
	}
	cSeatLiveView.prototype.setAction = function(argActionName, argChipAmount)
	{
		this.ElementAction.innerHTML = argActionName;
			let amount = "";
		if(argActionName && argChipAmount > 0)
		{
			amount = argChipAmount;
		}
		this.ElementBetAmount.innerHTML = amount;
	}

    ns.cSeatLiveView = cSeatLiveView;
})(PokerBrowser = PokerBrowser || {});
