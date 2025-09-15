var PokerBrowser = PokerBrowser || {};
PokerBrowser.engine = PokerBrowser.engine || (function(){
	var version = 1.00;

	// BLEデバイス関係
	const BLE_DEVICE_NAME_PREFIX = "PTV_PP_";
	const BLE_DEVICE_PROBE_NAME_DEALER = "Dealer01";
	const UUID_SERVICE = "cbaabb28-4e81-49c4-b775-aedfd27d8db0";
	const UUID_CHARACTERISTIC = "45f116ee-b087-4271-888d-a15eebebd2eb";

	const COMMAND_PROBE_ADD = "command_probe_add"; // ユーザー追加コマンド
	const COMMAND_DEAL_HAND = "command_deal_hand"; // ハンド開始コマンド
	const COMMAND_FIX_HAND = "command_fix_hand"; // ハンド固定コマンド
	const COMMAND_START_FLOP = "command_start_flop"; // フロップ開始コマンド
	const COMMAND_START_TURN = "command_start_turn"; // ターン開始コマンド
	const COMMAND_START_RIVER = "command_start_river"; // リバー開始コマンド
	const COMMAND_END_HAND = "command_end_hand"; // ハンド終了コマンド
	
	const COMMAND_DEV_DEAL_HAND = "command_dev_deal_hands"; // [開発] ハンド配布
	const COMMAND_DEV_DEAL_FLOP = "command_dev_deal_flop"; // [開発] ハンド配布
	const COMMAND_DEV_DEAL_TURN = "command_dev_deal_turn"; // [開発] ハンド配布
	const COMMAND_DEV_DEAL_RIVER = "command_dev_deal_river"; // [開発] ハンド配布

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

	const TEMPLATE_DEALER_CONTROL = "template_panel_dealer_control";
	const TEMPLATE_DEALER_CONTROL_HAND = "template_panel_dealer_probe_hand";
	const TEMPLATE_DEALER_CONTROL_ROUND = "template_panel_dealer_probe_round";
	const TEMPLATE_DEALER_CONTROL_BOARD_FLOP = "template_panel_dealer_probe_flop";
	const TEMPLATE_DEALER_CONTROL_BOARD_TURN = "template_panel_dealer_probe_turn";
	const TEMPLATE_DEALER_CONTROL_BOARD_RIVER = "template_panel_dealer_probe_river";
	const TEMPLATE_DEALER_CONTROL_RSSI = "template_panel_dealer_probe_rssi";
	const TEMPLATE_DEALER_CONTROL_Battery = "template_panel_dealer_probe_battery";

	const TEMPLATE_DEALER_VIEW = "template_panel_dealer_view";
	const TEMPLATE_DEALER_VIEW_DRAG = "template_panel_dealer_view_drag";
	const TEMPLATE_DEALER_VIEW_BOARD_FLOP = "template_panel_dealer_view_flop";
	const TEMPLATE_DEALER_VIEW_BOARD_TURN = "template_panel_dealer_view_turn";
	const TEMPLATE_DEALER_VIEW_BOARD_RIVER = "template_panel_dealer_view_river";
	
	const ELEMENT_PANEL_PROBE = "element_panel_probe";

	const CLASS_CARD_NORMAL = "template_card_hand";
	const CLASS_CARD_SMALL = "template_card_hand_small";

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
	function createHoleCardsHTML(argHoleCards, argClassName, argCapacity)
	{
		let html = "";
		let index = 0;
		for(const card of argHoleCards)
		{
			html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-${card}.png">`;
			index++;
		}
		while(index < argCapacity)
		{
			html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-0.png">`;
			index++;
		}
		return html;
	}


	// =====================================================================
	// DnDまわり
	// =====================================================================
	function cDragableElement(argElement)
	{
		this.TargetElement = argElement;
		HtmlUtil.addEventListenerToElement(argElement, "pointerdown", this.onDragStart.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointermove", this.onDragMove.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointerup", this.onDragEnd.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointercancel", this.onDragEnd.bind(this));

		this.Draggning = false;
		this.DragPrevX = 0;
		this.DragPrevY = 0;
		this.TransX = 0;
		this.TransY = 0;
	}
	cDragableElement.prototype.onDragStart = function(event)
	{
		event.preventDefault();
		this.Draggning = true;
		this.DragPrevX = event.clientX;
		this.DragPrevY = event.clientY;
	}
	cDragableElement.prototype.onDragMove = function(event)
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
			this.TargetElement.style.transform = `translate(${nx}px, ${ny}px)`;
		}
	}
	cDragableElement.prototype.onDragEnd = function(event)
	{
		this.Draggning = false;
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
			const scan_count = this.SeatView.getScanCount();

			// カードの更新
			let need_to_update = false;
			let max_rssi = 0;
			if(json.cards.length >= 1)
			{
				for(const card of json.cards)
				{
					if(PokerModel.isUsedCard(card.card))
					{
						continue;
					}
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
				const hold_cards = this.getTopNFrequentItems(this.ReceiveHistory, scan_count);
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
	cProbe.prototype.proceedRound = function()
	{
		this.ReceiveHistory = [];
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
		this.ElementHand.innerHTML = createHoleCardsHTML(argHoleCards, CLASS_CARD_SMALL, 2);
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
		this.DragControl = new cDragableElement(this.ElementDrag);
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
		this.ElementWinRate.innerHTML= "";
	}
	cSeatLiveView.prototype.toActive = function()
	{
		this.ElementInfos.classList.toggle("fold", false);
		this.ElementName.classList.toggle("fold", false);
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
		this.ElementHand.innerHTML = createHoleCardsHTML(argHoleCards, CLASS_CARD_NORMAL);
	}
	cSeatLiveView.prototype.setWinRate = function(argWinRate)
	{
		this.ElementWinRate.innerHTML= `${argWinRate}%`;
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
		this.Round = PokerConst.BettingRound.Invalid;
		this.PlayerName = "";
		this.CurrentHoleCards = [];

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
	cSeatView.prototype.getScanCount = function()
	{
		return 2;
	}
	cSeatView.prototype.getPlayerName = function()
	{
		return this.PlayerName;
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
			const disp_hole_cards = argHoleCards.sort((a, b) => CARD_ORDER[a] - CARD_ORDER[b]);
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
		this.DragControl = new cDragableElement(this.ElementDrag);
	}
	cDealerLiveView.prototype.setBoardFlop = function(argCards)
	{
		this.ElementBoardFlop.innerHTML = createHoleCardsHTML(argCards, CLASS_CARD_NORMAL, 3);
	}
	cDealerLiveView.prototype.setBoardTurn = function(argCards)
	{
		this.ElementBoardTurn.innerHTML = createHoleCardsHTML(argCards, CLASS_CARD_NORMAL, 1);
	}
	cDealerLiveView.prototype.setBoardRiver = function(argCards)
	{
		this.ElementBoardRiver.innerHTML = createHoleCardsHTML(argCards, CLASS_CARD_NORMAL, 1);
	}

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
		}
	}
	cDealerControlView.prototype.setRSSI = function(argRSSI)
	{
		this.ElementRssi.innerHTML = "R:" + argRSSI;
	}
	cDealerControlView.prototype.setBattery = function(argBattery)
	{
		this.ElementBattery.innerHTML ="B:" + argBattery + "%";
	}
	cDealerControlView.prototype.setHandCount = function(argHandCount)
	{
		this.ElementHand.innerHTML = `Hand: ${argHandCount}`;
	}
	cDealerControlView.prototype.setBoardFlop = function(argCards)
	{
		this.ElementBoardFlop.innerHTML = createHoleCardsHTML(argCards, CLASS_CARD_NORMAL, 3);
	}
	cDealerControlView.prototype.setBoardTurn = function(argCards)
	{
		this.ElementBoardTurn.innerHTML = createHoleCardsHTML(argCards, CLASS_CARD_NORMAL, 1);
	}
	cDealerControlView.prototype.setBoardRiver = function(argCards)
	{
		this.ElementBoardRiver.innerHTML = createHoleCardsHTML(argCards, CLASS_CARD_NORMAL, 1);
	}

	// =====================================================================
	// Dealer オブジェクト
	// =====================================================================
	function cDealerView(argControlBaseElement, argLiveBaseElement)
	{
		this.ControlView = new cDealerControlView(argControlBaseElement);
		this.LiveView = new cDealerLiveView(argLiveBaseElement);
		this.Round = PokerConst.BettingRound.Invalid;
		this.BoardFlop = [];
		this.BoardTurn = [];
		this.BoardRiver = [];
		this.SeatName = BLE_DEVICE_PROBE_NAME_DEALER;
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
	cDealerView.prototype.setHoleCards = function(argHoleCards)
	{
		const disp_hole_cards = argHoleCards.sort((a, b) => CARD_ORDER[a] - CARD_ORDER[b]);
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
	cDealerView.prototype.setRound = function(argRound)
	{
		this.CurrentRound = argRound;
		this.ControlView.setRound(argRound);
		switch(this.CurrentRound)
		{
			case PokerConst.BettingRound.Flop:
				break;
			case PokerConst.BettingRound.Turn:
				PokerModel.useFlopCards(this.BoardFlop);
				break;
			case PokerConst.BettingRound.River:
				PokerModel.useTurnCards(this.BoardTurn);
				break;
			case PokerConst.BettingRound.EndHand:
				PokerModel.useRiverCards(this.BoardRiver);
				break;
			default:
				break;
		}
	}
	cDealerView.prototype.setHandCount = function(argHandCount)
	{
		this.ControlView.setHandCount(argHandCount);
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
	cDealerView.prototype.getCurrentCommunityCards = function()
	{
		return this.BoardFlop.concat(this.BoardTurn, this.BoardRiver);
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
+
		// HTML 構造の取得
		HtmlUtil.addButtonEventListenerByID(COMMAND_PROBE_ADD, this.onCommandProbeAdd.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEAL_HAND, this.onCommandDealHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_FIX_HAND, this.onCommandFixHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_FLOP, this.onCommandStartFlop.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_TURN, this.onCommandStartTurn.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_RIVER, this.onCommandStartRiver.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_END_HAND, this.onCommandEndHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_HAND, this.onCommandDevDealHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_FLOP, this.onCommandDevDealFlop.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_TURN, this.onCommandDevDealTurn.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_RIVER, this.onCommandDevDealRiver.bind(this));
		
		this.ScreenUserList = document.getElementById(SCREEN_USER_LIST);
		this.ScreenDisplay = document.getElementById(SCREEN_DISPLAY);
		this.DealerControlElementBase = document.getElementById(TEMPLATE_DEALER_CONTROL);
		this.TemplateDealerLive = document.getElementById(TEMPLATE_DEALER_VIEW).cloneNode(true);
		this.TemplateSeatLive = document.getElementById(TEMPLATE_PANEL_CURRENT_HAND).cloneNode(true);
		this.TemplateSeatControl = document.getElementById(TEMPLATE_PANEL_PROBE).cloneNode(true);

		// ディスプレイフィールドの初期化
		this.ScreenDisplay.innerHTML = "";

		// ディーラー系コントロールパネルの初期化
		const dealer_live_view = this.TemplateDealerLive.cloneNode(true);
		this.DealerView = new cDealerView(this.DealerControlElementBase, dealer_live_view);
		this.ScreenDisplay.appendChild(dealer_live_view);

		// ユーザー系コントロールパネルの初期化
		this.SeatViews = [];
		this.DealerSeatName = "";
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
		this.Probes = [];
		console.log("cEngine.prototype.init - ok");
	}
	// シートビューの取得
	cEngine.prototype.getSeatView = function(argName)
	{
		if(argName == BLE_DEVICE_PROBE_NAME_DEALER)
		{
			return this.DealerView;
		}

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
		this.broadcastRound(PokerConst.BettingRound.DealHand);
	}
	// ハンド開始コマンド
	cEngine.prototype.onCommandFixHand = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Preflop);
	}
	// フロップ開始コマンド
	cEngine.prototype.onCommandStartFlop = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Flop);
		PokerModel.startFlop();
	}
	// ターン開始コマンド
	cEngine.prototype.onCommandStartTurn = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Turn);
		PokerModel.startTurn();
	}
	// リバー開始コマンド
	cEngine.prototype.onCommandStartRiver = function()
	{
		this.broadcastRound(PokerConst.BettingRound.River);
		PokerModel.startRiver();
	}
	// ハンド終了コマンド
	cEngine.prototype.onCommandEndHand = function()
	{
		this.broadcastRound(PokerConst.BettingRound.EndHand);
	}

	// ---------------------------------------------------------------------
	// コマンド処理まわり(開発オンリー)
	// ---------------------------------------------------------------------
	cEngine.prototype.onCommandDevDealHand = function()
	{
		this.startHand();
		this.broadcastRound(PokerConst.BettingRound.DealHand);
		for(const seat of  this.SeatViews)
		{
			if(seat.isActive())
			{
				const holdcard = [
					PokerModel.CurrentHand.Deck.drawCard(),
					PokerModel.CurrentHand.Deck.drawCard(),
				];
				seat.setHoleCards(holdcard);
			}
		}
	}
	cEngine.prototype.onCommandDevDealFlop = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Flop);
		const holdcard = [
			PokerModel.CurrentHand.Deck.drawCard(),
			PokerModel.CurrentHand.Deck.drawCard(),
			PokerModel.CurrentHand.Deck.drawCard(),
		];
		this.DealerView.setHoleCards(holdcard);
	}
	cEngine.prototype.onCommandDevDealTurn = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Turn);
		const holdcard = [
			PokerModel.CurrentHand.Deck.drawCard(),
		];
		this.DealerView.setHoleCards(holdcard);
	}
	cEngine.prototype.onCommandDevDealRiver = function()
	{
		this.broadcastRound(PokerConst.BettingRound.River);
		const holdcard = [
			PokerModel.CurrentHand.Deck.drawCard(),
		];
		this.DealerView.setHoleCards(holdcard);
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

		// ハンドカウントを進める
		PokerModel.startHand();
		this.DealerView.setHandCount(PokerModel.getCurrentHandCount());

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
	// ラウンドの設定
	cEngine.prototype.broadcastRound = function(argRound)
	{
		this.SeatViews.forEach(x => x.setRound(argRound));
		this.DealerView.setRound(argRound);
		this.Probes.forEach(x => x.proceedRound());
	}

	cEngine.prototype.broadcastWinrate = function()
	{
		// 現在の制約上、フロップが開くまでは確率表示できない。
		const community_cards = this.DealerView.getCurrentCommunityCards();
		if(community_cards.length < 3)
		{
			return;
		}

		// 勝率計算処理に食わせられるようにする
		let index_table = [];
		let hand_info = [];
		for(let index=0; index<this.SeatViews.length; ++index)
		{
			const seat = this.SeatViews[index];
			if(!seat.isActive())
			{
				continue;
			}
			if(seat.CurrentHoleCards.length < 2)
			{
				continue;
			}
			index_table.push(index);
			hand_info.push(seat.CurrentHoleCards);
		}

		// 勝率計算
		const result = WinRate.calc(hand_info, community_cards, [])
		for(let result_index=0; result_index<result.infos.length; ++result_index)
		{
			const access_index = index_table[result_index];
			const seat = this.SeatViews[access_index];
			const result_unit = result.infos[result_index];
			const rate = Math.round((result_unit.win * 100 / result_unit.comb));
			seat.setWinRate(rate);
		}
	}

	// =====================================================================
	// エンジンオブジェクト生成
	// =====================================================================
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