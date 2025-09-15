var PokerBrowser = PokerBrowser || {};
PokerBrowser.engine = PokerBrowser.engine || (function(){
	var version = 1.00;

	// BLEデバイス関係
	const BLE_DEVICE_NAME_PREFIX = "PTV_PP_";
	const BLE_DEVICE_PROBE_NAME_DEALER_PREFIX = "Dealer";
	const UUID_SERVICE = "cbaabb28-4e81-49c4-b775-aedfd27d8db0";
	const UUID_CHARACTERISTIC = "45f116ee-b087-4271-888d-a15eebebd2eb";

	const COMMAND_PROBE_ADD = "command_probe_add"; // ユーザー追加コマンド
	const COMMAND_DEAL_HAND = "command_deal_hand"; // ハンド開始コマンド
	const COMMAND_FIX_HAND = "command_fix_hand"; // ハンド固定コマンド
	const COMMAND_START_FLOP = "command_start_flop"; // フロップ開始コマンド
	const COMMAND_START_TURN = "command_start_turn"; // ターン開始コマンド
	const COMMAND_START_RIVER = "command_start_river"; // リバー開始コマンド

	const COMMAND_DEV_DEAL_HAND = "command_dev_deal_hand"; // [開発] ハンド配布

	const SCREEN_USER_LIST = "screen_management_user_list"; // ユーザーリスト表示領域
	const SCREEN_DISPLAY = "screen_display";

	const TEMPLATE_PANEL_CURRENT_HAND = "template_panel_user_current_hand";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_NAME = "template_panel_user_current_hand_value_name";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_POSITION = "template_panel_user_current_hand_value_position";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_WINRATE = "template_panel_user_current_hand_value_winrate";
	const TEMPLATE_PANEL_CURRENT_HAND_VALUE_HAND = "template_panel_user_current_hand_value_hand";

	const TEMPLATE_PANEL_PROBE = "template_panel_probe";
	const TEMPLATE_PANEL_PROBE_DRAG = "template_panel_user_current_hand_drag";
	const TEMPLATE_PANEL_PROBE_INFOS = "template_panel_user_current_hand_infos";
	const TEMPLATE_PANEL_PROBE_VALUE_SEAT_ID = "template_panel_probe_value_seat_id_value";
	const TEMPLATE_PANEL_PROBE_VALUE_NAME_INPUT = "template_panel_probe_value_seat_name_input";
	const TEMPLATE_PANEL_PROBE_VALUE_HAND = "template_panel_probe_value_hand";
	const TEMPLATE_PANEL_PROBE_VALUE_RSSI = "template_panel_probe_value_rssi";
	const TEMPLATE_PANEL_PROBE_VALUE_BATTERY = "template_panel_probe_value_battery";
	const TEMPLATE_PANEL_PROBE_COMMANBD_ACTIVITY_FOLD = "template_panel_probe_command_fold";
	const TEMPLATE_PANEL_PROBE_COMMANBD_ALLIN = "template_panel_probe_command_allin";
	const TEMPLATE_PANEL_PROBE_COMMANBD_POSITION = "template_panel_probe_command_position";
	const TEMPLATE_PANEL_PROBE_COMMANBD_ALIVE = "template_panel_probe_command_alive";

	const ELEMENT_PANEL_PROBE = "element_panel_probe";

	// カードの表示順
	const CARD_ORDER = [
		0,
	//	A,  2,  3,  4,  5,  6,  7,  8,  9,  T,  J,  Q, K
		1, 49, 45, 41, 37, 33, 29, 25, 21, 17, 13,  9, 5,
		2, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6,
		3, 51, 47, 43, 39, 35, 31, 27, 23, 19, 15, 11, 7,
		4, 52, 48, 44, 40, 36, 32, 28, 24, 20, 16, 12, 8,
	]

	// ポジション名
	const POKER_POSITION_DEALER = "D";
	const POKER_POSITION_CUTOFF = "CO";
	const POKER_POSITION_HIJACK = "HJ";
	const POKER_POSITION_MIDDLEp1 = "MP+1";
	const POKER_POSITION_MIDDLE = "MP";
	const POKER_POSITION_UTGp2 = "UTG+2";
	const POKER_POSITION_UTGp1 = "UTG+1";
	const POKER_POSITION_UTG = "UTG";
	const POKER_POSITION_BB = "BB";
	const POKER_POSITION_SB = "SB";
	const POKER_POSITION_OPENSEAT = "-";

	// ポジションリスト。ポジションの悪い方から
	const POKER_POSITION_TABLE = [
		// あると便利なので定義してるだけ
		[POKER_POSITION_OPENSEAT],
		[POKER_POSITION_DEALER],
		// ヘッズアップ
		[POKER_POSITION_DEALER, POKER_POSITION_BB],
		// 3 名
		[POKER_POSITION_DEALER, POKER_POSITION_BB, POKER_POSITION_SB],
		// 4 名
		[POKER_POSITION_DEALER, POKER_POSITION_UTG, POKER_POSITION_BB, POKER_POSITION_SB],
		// 5 名
		[POKER_POSITION_DEALER, POKER_POSITION_MIDDLE, POKER_POSITION_UTG, POKER_POSITION_BB, POKER_POSITION_SB],
		// 6 名
		[POKER_POSITION_DEALER, POKER_POSITION_CUTOFF, POKER_POSITION_HIJACK, POKER_POSITION_UTG, POKER_POSITION_BB, POKER_POSITION_SB],
		// 7 名
		[POKER_POSITION_DEALER, POKER_POSITION_CUTOFF, POKER_POSITION_HIJACK, POKER_POSITION_MIDDLE, POKER_POSITION_UTG, POKER_POSITION_BB, POKER_POSITION_SB],
		// 8 名
		[POKER_POSITION_DEALER, POKER_POSITION_CUTOFF, POKER_POSITION_HIJACK, POKER_POSITION_MIDDLE, POKER_POSITION_UTGp1, POKER_POSITION_UTG, POKER_POSITION_BB, POKER_POSITION_SB],
		// 9 名
		[POKER_POSITION_DEALER, POKER_POSITION_CUTOFF, POKER_POSITION_HIJACK, POKER_POSITION_MIDDLEp1, POKER_POSITION_MIDDLE, POKER_POSITION_UTGp1, POKER_POSITION_UTG, POKER_POSITION_BB, POKER_POSITION_SB],
		// 10 名
		[POKER_POSITION_DEALER, POKER_POSITION_CUTOFF, POKER_POSITION_HIJACK, POKER_POSITION_MIDDLEp1, POKER_POSITION_MIDDLE, POKER_POSITION_UTGp2, POKER_POSITION_UTGp1, POKER_POSITION_UTG, POKER_POSITION_BB, POKER_POSITION_SB],
	];
	

	// =====================================================================
	// ユーティリティ
	// =====================================================================
	function createHoleCardsHTML(argHoleCards, argClassName)
	{
		let html = "";
		let index = 0;
		for(const card of argHoleCards)
		{
			html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-${card}.png">`;
			index++;
		}
		while(index < 2)
		{
			html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-0.png">`;
			index++;
		}
		return html;
	}


	// =====================================================================
	// ユーザーハンドの表示
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
	// プローブとの通信まわり
	// =====================================================================
	function cProbe(argBLECharacteristic)
	{
		this.ProbeName = "";
		this.BLECharacteristic = argBLECharacteristic;
		this.SeatView = null;
		this.ReceiveHistory = [];
	}
	// 各プローブからのデータ受信時の処理
	cProbe.prototype.onCharacteristicValueChanged = function(event)
	{
		try {
			let characteristic = event.target;
			const decoder = new TextDecoder('utf-8');
			const str = decoder.decode(characteristic.value);
			const json = JSON.parse(str);
			this.ProbeName = json.probe;

			if(this.SeatView == null)
			{
				this.SeatView = PokerBrowser.engine.getSeatView(this.ProbeName);
			}
			if(this.SeatView == null)
			{
				return;
			}

			// 読み込み閾値の変更
			let rssi_threshold = 180;

			// カードの更新
			let need_to_update = false;
			let max_rssi = 0;
			if(json.cards.length >= 1)
			{
				for(const card of json.cards)
				{
					if(card.rssi >= rssi_threshold)
					{
						this.ReceiveHistory.push(card.card);
						if(this.ReceiveHistory.length > 16)
						{
							this.ReceiveHistory.shift();
						}
						need_to_update = true;
					}
					if(card.rssi > max_rssi)
					{
						max_rssi = card.rssi;
					}
				}
			}

			if(need_to_update)
			{
				const hold_cards = this.getTopNFrequentItems(this.ReceiveHistory, 2);
				this.SeatView.setHoleCards(hold_cards);
			}

			this.SeatView.setRSSI(max_rssi);
			this.SeatView.setBattery(json.battery);
		}
		catch(e){
			console.log("[cProbe] onCharacteristicValueChanged error ", this.ProbeName, e);
		}
	}
	// 配列内の要素を出現回数でカウントし、多い順に上位N個を返す関数
	cProbe.prototype.getTopNFrequentItems = function(array, n) 
	{
		const countMap = {};

		// 出現回数をカウント
		array.forEach(item => {
			countMap[item] = (countMap[item] || 0) + 1;
		});

		// 出現回数の降順に並べて上位N個を抽出
		const sorted = Object.entries(countMap)
		.sort((a, b) => b[1] - a[1])
		.slice(0, n);

		// 値（キー）だけ取り出す
		return sorted.map(entry => isNaN(entry[0]) ? entry[0] : Number(entry[0]));
	}

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
		this.CommandPosition = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase,  TEMPLATE_PANEL_PROBE_COMMANBD_POSITION);
		this.CommandAlive = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase,  TEMPLATE_PANEL_PROBE_COMMANBD_ALIVE);
		this.CommandAllIn = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_COMMANBD_ALLIN);
		this.InputName = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_PANEL_PROBE_VALUE_NAME_INPUT);
	
		HtmlUtil.addEventListenerToElement(this.CommandActivityFold, "click", argSeatView.onCommandActivityFold.bind(argSeatView));
		HtmlUtil.addEventListenerToElement(this.CommandPosition, "click", argSeatView.onCommandPosition.bind(argSeatView));
		HtmlUtil.addEventListenerToElement(this.CommandAlive, "click", argSeatView.onCommandAlive.bind(argSeatView));
		HtmlUtil.addEventListenerToElement(this.CommandAllIn, "click", argSeatView.onCommandAllIn.bind(argSeatView));
		HtmlUtil.addEventListenerToElement(this.InputName, "change", argSeatView.onInputName.bind(argSeatView));
	}
	cSeatControlView.prototype.toDealed = function()
	{
		this.leaveAnnIn();
		this.toActive();
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
	cSeatControlView.prototype.setSeatName = function(argSeatName)
	{
		this.ElementSeatValueID.innerHTML = argSeatName;
		this.InputName.id = "panel_seat_name_" + argSeatName;
		this.InputName.value = argSeatName;
	}
	cSeatControlView.prototype.setRSSI = function(argRSSI)
	{
		this.ElementRssi.innerHTML = "R:" + argRSSI;
	}
	cSeatControlView.prototype.setBattery = function(argBattery)
	{
		this.ElementBattery.innerHTML ="B:" + argBattery + "%";
	}
	cSeatControlView.prototype.setHoleCards = function(argHoleCards)
	{
		this.ElementHand.innerHTML = createHoleCardsHTML(argHoleCards, "template_card_hand_small");
	}
	cSeatControlView.prototype.setPosition = function(argPositionIndex, argAlivePlayerCount)
	{
		const position_name = POKER_POSITION_TABLE[argAlivePlayerCount][argPositionIndex];
		this.CommandPosition.innerHTML = position_name;
		this.ElementBase.classList.toggle("button", argPositionIndex == 0);
		this.ElementBase.classList.toggle("utg", position_name == POKER_POSITION_UTG);
	}

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

		HtmlUtil.addEventListenerToElement(this.ElementDrag, "pointerdown", this.onDragStart.bind(this));
		HtmlUtil.addEventListenerToElement(this.ElementDrag, "pointermove", this.onDragMove.bind(this));
		HtmlUtil.addEventListenerToElement(this.ElementDrag, "pointerup", this.onDragEnd.bind(this));
		HtmlUtil.addEventListenerToElement(this.ElementDrag, "pointercancel", this.onDragEnd.bind(this));

		this.Draggning = false;
		this.DragPrevX = 0;
		this.DragPrevY = 0;
		this.TransX = 0;
		this.TransY = 0;
	}
	cSeatLiveView.prototype.onDragStart = function(event)
	{
		event.preventDefault();
		this.Draggning = true;
		this.DragPrevX = event.clientX;
		this.DragPrevY = event.clientY;
	}
	cSeatLiveView.prototype.onDragMove = function(event)
	{
		const grid_size = 16;
		if(this.Draggning)
		{
			let dx = event.clientX - this.DragPrevX;
			let dy = event.clientY - this.DragPrevY;
			this.TransX += dx;
			this.TransY += dy;
			this.DragPrevX = event.clientX;
			this.DragPrevY = event.clientY;
			const nx = Math.round(this.TransX/grid_size)*grid_size;
			const ny = Math.round(this.TransY/grid_size)*grid_size;
			this.ElementDrag.style.transform = `translate(${nx}px, ${ny}px)`;
		}
	}
	cSeatLiveView.prototype.onDragEnd = function(event)
	{
		this.Draggning = false;
	}
	cSeatLiveView.prototype.setName = function(argName)
	{
		this.ElementName.innerHTML = argName;
	}
	cSeatLiveView.prototype.setPosition = function(argPositionIndex, argAlivePlayerCount)
	{
		const position_name = POKER_POSITION_TABLE[argAlivePlayerCount][argPositionIndex];
		this.ElementPosition.innerHTML = position_name;
	}
	cSeatLiveView.prototype.toDealed = function()
	{
		this.leaveAnnIn();
		this.toActive();
	}
	cSeatLiveView.prototype.toFold = function()
	{
		this.ElementInfos.classList.toggle("fold", true);
		this.ElementName.classList.toggle("fold", true);
	}
	cSeatLiveView.prototype.toActive = function()
	{
		this.ElementInfos.classList.toggle("fold", false);
		this.ElementName.classList.toggle("fold", false);
	}
	cSeatLiveView.prototype.toDead = function()
	{
		this.ElementBase.classList.toggle("seatopen", true);
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
		this.ElementHand.innerHTML = createHoleCardsHTML(argHoleCards, "template_card_hand");
	}

	// =====================================================================
	// プローブの表示まわり
	// =====================================================================
	function cSeatView(argSeatName, argSeatControlViewElement, argSeatLiveViewElemwent)
	{
		this.SeatControl = new cSeatControlView(this, argSeatControlViewElement);
		this.SeatLive = new cSeatLiveView(argSeatLiveViewElemwent);
		this.Active = true;
		this.Alive = false;
		this.AllIn = false;
		this.PositionIndex = 0; // ディーラーまでの人数
		this.AlivePlayerCount = 0;

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
			this.SeatControl.toDealed();
			this.SeatLive.toDealed();
		}
	}
	cSeatView.prototype.toFold = function()
	{
		if(this.Alive)
		{
			this.Active = false;
			this.SeatControl.toFold();
			this.SeatLive.toFold();
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
		this.Alive = false;
		this.AllIn = false;
		this.SeatControl.toDead();
		this.SeatLive.toDead();
	}
	cSeatView.prototype.toAlive = function()
	{
		this.Alive = true;
		this.AllIn = false;
		this.SeatControl.toAlive();
		this.SeatLive.toAlive();
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

	// ---------------------------------------------------------------------
	// 状態の設定
	// ---------------------------------------------------------------------
	cSeatView.prototype.setSeatName = function(argSeatName)
	{
		this.SeatName = argSeatName;
		this.SeatControl.setSeatName(argSeatName);
		this.SeatLive.setName(argSeatName);
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
		const disp_hole_cards = argHoleCards.sort((a, b) => CARD_ORDER[a] - CARD_ORDER[b]);
		this.SeatControl.setHoleCards(disp_hole_cards);
		this.SeatLive.setHoleCards(disp_hole_cards);
	}
	cSeatView.prototype.setPosition = function(argPositionIndex, argAlivePlayerCount)
	{
		this.PositionIndex = argPositionIndex;
		this.AlivePlayerCount = argAlivePlayerCount;
		this.SeatControl.setPosition(argPositionIndex, argAlivePlayerCount);
		this.SeatLive.setPosition(argPositionIndex, argAlivePlayerCount);
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
		HtmlUtil.addButtonEventListenerByID(COMMAND_PROBE_ADD, this.onCommandProbeAdd.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEAL_HAND, this.onCommandDealHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_FIX_HAND, this.onCommandFixHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_FLOP, this.onCommandStartFlop.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_TURN, this.onCommandStartTurn.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_RIVER, this.onCommandStartRiver.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_HAND, this.onCommandDevDealHand.bind(this));
		this.ScreenUserList = document.getElementById(SCREEN_USER_LIST);
		this.ScreenDisplay = document.getElementById(SCREEN_DISPLAY);
		this.TemplateSeatLive = document.getElementById(TEMPLATE_PANEL_CURRENT_HAND).cloneNode(true);
		this.TemplateSeatControl = document.getElementById(TEMPLATE_PANEL_PROBE).cloneNode(true);

		// コントロールパネルの初期化
		this.SeatViews = [];
		this.DealerSeatName = "";
		this.ScreenDisplay.innerHTML = "";
		const element_panel_probes = document.getElementsByClassName(ELEMENT_PANEL_PROBE);
		for(const element of element_panel_probes)
		{
			const id = element.id;
			const seat_control_element = this.TemplateSeatControl.cloneNode(true);
			const seat_view_element = this.TemplateSeatLive.cloneNode(true);
			const view = new cSeatView(id, seat_control_element, seat_view_element);
			this.SeatViews.push(view);

			// HTML の書き換え
			element.innerHTML = "";
			element.appendChild(seat_control_element);
			this.ScreenDisplay.appendChild(seat_view_element);
		}

		//
		this.HandPlayerPanels = [];
		this.Probes = [];
		console.log("cEngine.prototype.init - ok");
	}

	cEngine.prototype.getSeatView = function(argName)
	{
		const view = this.SeatViews.find(x => x.SeatName == argName);
		if(view)
		{
			return view;
		}

		const new_view = new cSeatView(argName, this.TemplateProbe);
		this.SeatViews.push(new_view);
		return new_view;
	}

	// ---------------------------------------------------------------------
	// コマンド処理まわり
	// ---------------------------------------------------------------------
	// プローブリスト追加コマンドの処理をする
	cEngine.prototype.onCommandProbeAdd = async function()
	{
		console.log("PokerTableMonitor engine.onCommandAddProbe");
		try {
			// 1. デバイスをスキャン
			const device = await navigator.bluetooth.requestDevice({
				filters: [
					{ services: [UUID_SERVICE]},
					{ namePrefix : [BLE_DEVICE_NAME_PREFIX], }
				]
			});
		
			// 2. GATT サーバへ接続
			const server = await device.gatt.connect();
		
			// 3. サービス取得
			const service = await server.getPrimaryService(UUID_SERVICE);
		
			// 4. キャラクタリスティック取得
			const characteristic = await service.getCharacteristic(UUID_CHARACTERISTIC);

			// 管理オブジェクトとの紐付けを行ない引き渡す
			const probe = new cProbe(characteristic);
			characteristic.addEventListener('characteristicvaluechanged', probe.onCharacteristicValueChanged.bind(probe));
			characteristic.startNotifications();
			this.Probes.push(probe);
		} 
		catch (error) {
			console.error('BLE読み取りエラー:', error);
		}
	}
	// ハンド開始コマンド
	cEngine.prototype.onCommandDealHand = function()
	{
		this.startHand();
	}
	// ハンド開始コマンド
	cEngine.prototype.onCommandFixHand = function()
	{
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
	// コマンド処理まわり(開発オンリー)
	// ---------------------------------------------------------------------
	cEngine.prototype.onCommandDevDealHand = function()
	{
	}
	// ---------------------------------------------------------------------
	// 論理設定
	// ---------------------------------------------------------------------
	// ハンド開始時の処理
	cEngine.prototype.startHand = function()
	{
		// 次のボタン
		const button_index = this.SeatViews.findIndex(x => x.SeatName == this.DealerSeatName);
		if(button_index >= 0)
		{
			for(let count=0; count<this.SeatViews.length; ++count)
			{
				let index = (button_index + count + 1) % this.SeatViews.length;
				const seat = this.SeatViews[index];
				if(seat.isAlive())
				{
					this.setButton(seat.SeatName);
					break;
				}
			}
		}

		// シートの状態の初期化
		for(const seat of this.SeatViews)
		{
			seat.toDealed();
		}
	}
	// ボタンの設定
	cEngine.prototype.setButton = function(argSeatName)
	{
		this.DealerSeatName = "";
		let alive_player_num = 0;
		for(const seat of this.SeatViews)
		{
			if(seat.isAlive())
			{
				++alive_player_num;
			}
		}

		const button_index = this.SeatViews.findIndex(x => x.SeatName == argSeatName);
		if(button_index < 0)
		{
			return;
		}

		this.DealerSeatName = argSeatName;
		let position_index = alive_player_num - 1;
		for(let count=0; count<this.SeatViews.length; ++count)
		{
			let index = (button_index + count + 1) % this.SeatViews.length;
			const seat = this.SeatViews[index];
			if(seat.isAlive())
			{
				seat.setPosition(position_index, alive_player_num);
				position_index--;
			}
		}
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