var PokerBrowser = PokerBrowser || {};
PokerBrowser.engine = PokerBrowser.engine || (function(){
	var version = 1.00;
	const TABMENU_MANAGEMENT = "tabmenu_management";
	const TABMENU_CURRENT_HAND = "tabmenu_current_hand";
	const TAB_MANAGEMENT = "tab_management";
	const TAB_CURRENT_HAND = "tab_current_hand";

	const COMMAND_USER_ADD = "command_user_add"; // ユーザー追加コマンド
	const COMMAND_START_HAND = "command_start_hand"; // ハンド開始コマンド
	const COMMAND_START_FLOP = "command_start_flop"; // フロップ開始コマンド
	const COMMAND_START_TURN = "command_start_turn"; // ターン開始コマンド
	const COMMAND_START_RIVER = "command_start_river"; // リバー開始コマンド
	const SCREEN_USER_LIST = "screen_management_user_list"; // ユーザーリスト表示領域
	const SCREEN_DISPLAY = "screen_display";

	const TEMPLATE_PANEL_CURRENT_HAND = "template_panel_user_current_hand";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_NAME = "template_panel_user_current_hand_value_name";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_POSITION = "template_panel_user_current_hand_value_position";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_WINRATE = "template_panel_user_current_hand_value_winrate";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_HAND = "template_panel_user_current_hand_value_hand";

	// =====================================================================
	// 
	// =====================================================================
	function cPanelCurrentHand(argPanelTemplate, argHandPlayer)
	{
		this.HandPlayer = argHandPlayer;
		this.ElementBase = argPanelTemplate.cloneNode(true);
		this.ElementName = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_NAME);
		this.ElementPosition = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_POSITION);
		this.ElementWinRate = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_WINRATE);
		this.ElementHand = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_CURRENT_HAND_VALUE_HAND);
	}
	cPanelCurrentHand.prototype.render = function()
	{
		this.ElementName.innerHTML = this.HandPlayer.Player.Identifier;
	}

	// =====================================================================
	// engine オブジェクト
	// =====================================================================
	function cEngine()
	{
	}
	// 初期化
	cEngine.prototype.init = function()
	{
		console.log("cEngine.prototype.init");
		PokerModel.bindModelUpdateNotifier(this);
		HtmlUtil.addButtonEventListenerByID(COMMAND_USER_ADD, this.onCommandUserAdd.bind(this));
		HtmlUtil.addButtonEventListenerByID(TABMENU_MANAGEMENT, this.onTabmenuManagement.bind(this));
		HtmlUtil.addButtonEventListenerByID(TABMENU_CURRENT_HAND, this.onTabmenuCurrentHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_HAND, this.onCommandStartHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_FLOP, this.onCommandStartFlop.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_TURN, this.onCommandStartTurn.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_RIVER, this.onCommandStartRiver.bind(this));
		this.ScreenUserList = document.getElementById(SCREEN_USER_LIST);
		this.ScreenDisplay = document.getElementById(SCREEN_DISPLAY);
		this.TemplatePanelCurrentHand = document.getElementById(TEMPLATE_PANEL_CURRENT_HAND).cloneNode(true);
		this.HandPlayerPanels = [];
		console.log("cEngine.prototype.init - ok");

	}
	// ---------------------------------------------------------------------
	// ユーティリティ
	// ---------------------------------------------------------------------
	cEngine.prototype.openTab = function(evt, tagId)
	{
		// 全タブを非表示
		document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
		document.querySelectorAll(".tab-menu button").forEach(el => el.classList.remove("active"));

		// 指定タブを表示
		document.getElementById(tagId).classList.add("active");
		evt.currentTarget.classList.add("active");
	}

	// ---------------------------------------------------------------------
	// コマンド処理まわり
	// ---------------------------------------------------------------------
	// 管理タブメニューを選択した時の処理
	cEngine.prototype.onTabmenuManagement = function(event)
	{
		this.openTab(event, TAB_MANAGEMENT);
	}
	// 現在ハンドのタブメニューを選択した時の処理
	cEngine.prototype.onTabmenuCurrentHand = function(event)
	{
		this.openTab(event, TAB_CURRENT_HAND);
		this.renderDisplayCurrentHand();
	}
	// ユーザーリスト追加コマンドの処理をする
	cEngine.prototype.onCommandUserAdd = function()
	{
		PokerModel.addUser("test");
	}
	// ハンド開始コマンド
	cEngine.prototype.onCommandStartHand = function()
	{
		PokerModel.startHand();
	}
	// フロップ開始コマンド
	cEngine.prototype.onCommandStartFlop = function()
	{
	}
	// ターン開始コマンド
	cEngine.prototype.onCommandStartTurn = function()
	{
	}
	// リバー開始コマンド
	cEngine.prototype.onCommandStartRiver = function()
	{
	}
	// ---------------------------------------------------------------------
	// モデルからの通知を受けるまわり
	// ---------------------------------------------------------------------
	// モデルの更新を受ける
	cEngine.prototype.notifyModelUpdate = function()
	{
		this.renderUserList();
		this.renderDisplayCurrentHand();
	}
	cEngine.prototype.notifyModelUpdateHand = function(hand)
	{
		this.HandPlayerPanels = [];
		for(const player of hand.HandPlayers)
		{
			const html = this.TemplatePanelCurrentHand.cloneNode(true);
			const panel = new cPanelCurrentHand(html, player);
			panel.render();
			this.HandPlayerPanels.push(panel);
		}
		this.renderDisplayCurrentHand();
	}

	// ---------------------------------------------------------------------
	// 表示更新まわり
	// ---------------------------------------------------------------------
	// ディスプレイに現在のハンドを表示する
	cEngine.prototype.renderDisplayCurrentHand = function()
	{
		const element = this.ScreenDisplay;
		element.replaceChildren();
		for(const panel of this.HandPlayerPanels)
		{
			element.appendChild(panel.ElementBase);
		}
	}
	// ユーザーリストの更新をする
	cEngine.prototype.renderUserList = function()
	{
		const element = this.ScreenUserList;
		let html = "<ul>";
		for(const player of PokerModel.PlayerList)
		{
			html += "<li>" + player.Identifier;
		}
		html += "</ul>";
		element.innerHTML = html;
	}
	
	engine = new cEngine();
	return engine;
})();

(function(){
	if(document.readyState === "loading")
	{
		document.addEventListener("DOMContentLoaded", PokerBrowser.engine.init.bind(PokerBrowser.engine));
	}
	else
	{
		PokerBrowser.engine.init();
	}
})();