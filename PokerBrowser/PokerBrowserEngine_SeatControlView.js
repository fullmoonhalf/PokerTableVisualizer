(function (ns) {
    "use strict";
    if(ns.cSeatControlView) return;

    const TEMPLATE_PANEL_PROBE_VALUE_SEAT_ID = "template_panel_probe_value_seat_id_value";
	const TEMPLATE_PANEL_PROBE_VALUE_NAME_INPUT = "template_panel_probe_value_seat_name_input";
	const TEMPLATE_PANEL_PROBE_VALUE_HAND = "template_panel_probe_value_hand";
	const TEMPLATE_PANEL_PROBE_VALUE_RSSI = "template_panel_probe_value_rssi";
	const TEMPLATE_PANEL_PROBE_VALUE_BATTERY = "template_panel_probe_value_battery";
	const TEMPLATE_PANEL_PROBE_VALUE_BET_AMOUNT_INPUT = "template_panel_probe_value_bet_amount_input";
	const TEMPLATE_PANEL_PROBE_VALUE_STACK_INPUT = "template_panel_probe_value_stack_input";
	const TEMPLATE_PANEL_PROBE_COMMANBD_ACTIVITY_FOLD = "template_panel_probe_command_fold";
	const TEMPLATE_PANEL_PROBE_COMMANBD_ACTIVITY_BET = "template_panel_probe_command_bet_action";
	const TEMPLATE_PANEL_PROBE_COMMANBD_ACTIVITY_CALL = "template_panel_probe_command_call_action";
	const TEMPLATE_PANEL_PROBE_COMMANBD_ALLIN = "template_panel_probe_command_allin";
	const TEMPLATE_PANEL_PROBE_COMMANBD_POSITION = "template_panel_probe_command_position";
	const TEMPLATE_PANEL_PROBE_COMMANBD_ALIVE = "template_panel_probe_command_alive";

	// =====================================================================
	// コントローラ側
	// =====================================================================
	function cSeatControlView(argSeatView, argElementBase)
	{
		this.ElementBase = argElementBase; 
		this.ElementSeatValueID = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_VALUE_SEAT_ID);
		this.ElementHand = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_VALUE_HAND);
		this.ElementRssi = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_VALUE_RSSI, "offline");
		this.ElementBattery = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_VALUE_BATTERY, "-");
		this.CommandActivityFold = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase,  TEMPLATE_PANEL_PROBE_COMMANBD_ACTIVITY_FOLD);
		this.CommandActivityBet = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase,  TEMPLATE_PANEL_PROBE_COMMANBD_ACTIVITY_BET);
		this.CommandActivityCall = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase,  TEMPLATE_PANEL_PROBE_COMMANBD_ACTIVITY_CALL);
		this.CommandPosition = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase,  TEMPLATE_PANEL_PROBE_COMMANBD_POSITION);
		this.CommandAlive = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase,  TEMPLATE_PANEL_PROBE_COMMANBD_ALIVE);
		this.CommandAllIn = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_COMMANBD_ALLIN);
		this.InputName = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_VALUE_NAME_INPUT);
		this.InputBetAmount = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_VALUE_BET_AMOUNT_INPUT);
		this.InputStack = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_VALUE_STACK_INPUT);
	
		HtmlUtil.addEventListenerToElement(this.CommandActivityFold, "click", argSeatView.onCommandActivityFold.bind(argSeatView));
		HtmlUtil.addEventListenerToElement(this.CommandPosition, "click", argSeatView.onCommandPosition.bind(argSeatView));
		HtmlUtil.addEventListenerToElement(this.CommandAlive, "click", argSeatView.onCommandAlive.bind(argSeatView));
		HtmlUtil.addEventListenerToElement(this.CommandAllIn, "click", argSeatView.onCommandAllIn.bind(argSeatView));
		HtmlUtil.addEventListenerToElement(this.InputName, "change", argSeatView.onInputName.bind(argSeatView));
	}
	// ---------------------------------------------------------------------
	// 進行処理関連
	// ---------------------------------------------------------------------
	cSeatControlView.prototype.toDealed = function()
	{
		this.leaveAnnIn();
		this.toActive();
		this.setHoleCards([]);
		this.InputBetAmount.value = 0;
	}
	cSeatControlView.prototype.toFold = function()
	{
		this.ElementBase.classList.toggle("fold", true);
		this.CommandActivityFold.innerHTML = "";
	}
	cSeatControlView.prototype.toActive = function()
	{
		this.ElementBase.classList.toggle("fold", false);
		this.CommandActivityFold.innerHTML = "Fold";
	}
	cSeatControlView.prototype.toDead = function()
	{
		this.ElementBase.classList.toggle("dead", true);
		this.ElementBase.classList.toggle("allin", false);
		this.CommandAlive.innerHTML = "Join";
	}
	cSeatControlView.prototype.toAlive = function()
	{
		this.ElementBase.classList.toggle("dead", false);
		this.ElementBase.classList.toggle("allin", false);
		this.CommandAlive.innerHTML = "Leave";
	}
	cSeatControlView.prototype.enterAllIn = function()
	{
		this.ElementBase.classList.toggle("allin", true);
		this.CommandAllIn.innerHTML = "";
	}
	cSeatControlView.prototype.leaveAnnIn = function()
	{
		this.ElementBase.classList.toggle("allin", false);
		this.CommandAllIn.innerHTML = "All-In";
	}
	// ---------------------------------------------------------------------
	// 状態取得
	// ---------------------------------------------------------------------
	cSeatControlView.prototype.getStack = function()
	{
		return Number(this.InputStack.value) || 0;
	}
	cSeatControlView.prototype.getBetAmount = function()
	{
		return Number(this.InputBetAmount.value) || 0;
	}
	// ---------------------------------------------------------------------
	// 状態設定
	// ---------------------------------------------------------------------
	cSeatControlView.prototype.setSeatName = function(argSeatName)
	{
		this.ElementSeatValueID.innerHTML = argSeatName;
		this.InputName.id = "panel_seat_name_" + argSeatName;
		this.InputName.value = argSeatName;
		this.InputBetAmount.id = "panel_seat_betamount_" + argSeatName;
		this.InputStack.id = "panel_seat_stack_" + argSeatName;
	}
	cSeatControlView.prototype.setRSSI = function(argRSSI)
	{
		this.ElementRssi.innerHTML = ns.convertRSSIExpression(argRSSI);
	}
	cSeatControlView.prototype.setBattery = function(argBattery)
	{
		this.ElementBattery.innerHTML = ns.convertBatteryExpression(argBattery);
	}
	cSeatControlView.prototype.setHoleCards = function(argHoleCards)
	{
		this.ElementHand.innerHTML = ns.createHoleCardsHTML(argHoleCards, ns.CLASS_CARD_SMALL, 2);
	}
	cSeatControlView.prototype.setPosition = function(argPositionIndex, argAlivePlayerCount)
	{
		const position_name = ns.convertPositionName(argAlivePlayerCount, argPositionIndex);
		this.CommandPosition.innerHTML = position_name;
		this.ElementBase.classList.toggle("button", argPositionIndex == 0);
		this.ElementBase.classList.toggle("utg", position_name == ns.POKER_POSITION_UTG);
	}
	cSeatControlView.prototype.setBetAmount = function(argAmount)
	{
		const stack = this.getStack();
		const amount = Math.min(stack, argAmount);
		this.InputBetAmount.value = amount;
		this.InputStack.value = stack - amount;
		return amount;
	}
	cSeatControlView.prototype.postAnti = function(argAmount)
	{
		const stack = this.getStack();
		const amount = Math.min(stack, argAmount);
		this.InputStack.value = stack - amount;
		return amount;
	}

    ns.cSeatControlView = cSeatControlView;
})(PokerBrowser = PokerBrowser || {});
